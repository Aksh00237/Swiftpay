package escrow_service.service;

import escrow_service.config.EscrowProperties;
import escrow_service.dto.CreateEscrowRequest;
import escrow_service.dto.DisputeRequest;
import escrow_service.dto.ResolveRequest;
import escrow_service.exception.ForbiddenException;
import escrow_service.exception.InvalidTransitionException;
import escrow_service.exception.NotFoundException;
import escrow_service.exception.PaymentFailedException;
import escrow_service.model.EscrowOrder;
import escrow_service.model.EscrowStatus;
import escrow_service.model.StatusChange;
import escrow_service.model.User;
import escrow_service.repository.EscrowOrderRepository;
import escrow_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.Instant;
import java.util.List;

/**
 * Escrow ("Safe Pay"): the buyer's money is held by the platform until the seller delivers.
 *
 * Every method that moves money runs in one MongoDB transaction: the wallet update and the
 * order's status change are committed together or not at all. Orders carry a @Version, so if
 * two actions hit the same order at once (buyer confirms while the scheduler auto-releases),
 * the second write fails and its whole transaction rolls back. The seller is never paid twice.
 */
@Service
@RequiredArgsConstructor
public class EscrowService {

    static final String SYSTEM = "system";
    private static final int MAX_DESCRIPTION = 200;

    private final EscrowOrderRepository orderRepository;
    private final UserRepository userRepository;
    private final EscrowProperties properties;
    private final Clock clock;

    // ───────────────────────── Buyer creates an order ─────────────────────────

    /**
     * Debits the buyer and parks the amount in a new order with status HELD.
     * If the same Idempotency-Key is sent again (double click, network retry), the original
     * order is returned and the buyer is not charged a second time.
     */
    @Transactional
    public EscrowOrder create(String buyerId, String idempotencyKey, CreateEscrowRequest request) {
        requireUserId(buyerId);

        if (!isBlank(idempotencyKey)) {
            var existing = orderRepository.findByIdempotencyKey(idempotencyKey);
            if (existing.isPresent()) {
                if (!existing.get().getBuyerId().equals(buyerId)) {
                    throw new IllegalArgumentException("Idempotency-Key already used by another request");
                }
                return existing.get();
            }
        }

        BigDecimal amount = validate(buyerId, request);

        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new NotFoundException("Buyer not found: " + buyerId));
        userRepository.findById(request.sellerId())
                .orElseThrow(() -> new NotFoundException("Seller not found: " + request.sellerId()));

        if (buyer.getBalance().compareTo(amount) < 0) {
            throw new PaymentFailedException("Insufficient balance");
        }

        Instant now = Instant.now(clock);

        buyer.setBalance(buyer.getBalance().subtract(amount));
        userRepository.save(buyer);

        EscrowOrder order = new EscrowOrder();
        order.setBuyerId(buyerId);
        order.setSellerId(request.sellerId());
        order.setDescription(request.description() == null ? null : request.description().trim());
        order.setAmount(amount);
        order.setStatus(EscrowStatus.HELD);
        order.setCreatedAt(now);
        order.setUpdatedAt(now);
        order.setDeliveryDeadline(now.plus(properties.deliveryWindow()));
        order.setIdempotencyKey(isBlank(idempotencyKey) ? null : idempotencyKey);
        order.getHistory().add(new StatusChange(null, EscrowStatus.HELD, buyerId, now, "Buyer paid, funds held"));
        return orderRepository.save(order);
    }

    // ───────────────────────── Seller actions ─────────────────────────

    @Transactional
    public EscrowOrder ship(String orderId, String userId) {
        EscrowOrder order = load(orderId);
        requireSeller(order, userId);

        Instant now = Instant.now(clock);
        order.moveTo(EscrowStatus.SHIPPED, userId, now, "Seller marked as shipped");
        order.setAutoReleaseAt(now.plus(properties.confirmWindow()));
        return orderRepository.save(order);
    }

    /** Seller can't fulfil the order: buyer gets the money back immediately. */
    @Transactional
    public EscrowOrder cancel(String orderId, String userId) {
        EscrowOrder order = load(orderId);
        requireSeller(order, userId);
        if (order.getStatus() != EscrowStatus.HELD) {
            throw new InvalidTransitionException("Only orders that haven't shipped can be cancelled");
        }
        return refund(order, userId, "Seller cancelled the order");
    }

    // ───────────────────────── Buyer actions ─────────────────────────

    @Transactional
    public EscrowOrder confirm(String orderId, String userId) {
        EscrowOrder order = load(orderId);
        requireBuyer(order, userId);
        return release(order, userId, "Buyer confirmed delivery");
    }

    // ───────────────────────── Disputes ─────────────────────────

    /** Buyer or seller raises a dispute. This freezes the money until an admin decides. */
    @Transactional
    public EscrowOrder dispute(String orderId, String userId, DisputeRequest request) {
        EscrowOrder order = load(orderId);
        requireParty(order, userId);
        if (request == null || isBlank(request.reason())) {
            throw new IllegalArgumentException("A reason is required to raise a dispute");
        }

        Instant now = Instant.now(clock);
        order.moveTo(EscrowStatus.DISPUTED, userId, now, request.reason().trim());
        order.setDisputeReason(request.reason().trim());
        order.setRaisedBy(userId);
        // Auto-release no longer applies; only an admin can move the money now
        order.setAutoReleaseAt(null);
        return orderRepository.save(order);
    }

    @Transactional
    public EscrowOrder resolve(String orderId, String userId, ResolveRequest request) {
        requireAdmin(userId);
        EscrowOrder order = load(orderId);
        if (order.getStatus() != EscrowStatus.DISPUTED) {
            throw new InvalidTransitionException("Only disputed orders can be resolved");
        }
        String note = request == null || isBlank(request.note()) ? "Resolved by admin" : request.note().trim();
        String outcome = request == null || request.outcome() == null ? "" : request.outcome().trim().toUpperCase();
        return switch (outcome) {
            case "REFUND" -> refund(order, userId, note);
            case "RELEASE" -> release(order, userId, note);
            default -> throw new IllegalArgumentException("outcome must be REFUND or RELEASE");
        };
    }

    // ───────────────────────── Scheduler actions ─────────────────────────

    /**
     * Seller missed the delivery deadline: refund the buyer.
     * Re-checks the order inside the transaction, because between the scheduler's query and
     * this call the seller may have shipped. Returns false if there was nothing to do.
     */
    @Transactional
    public boolean autoRefundIfExpired(String orderId) {
        EscrowOrder order = load(orderId);
        Instant now = Instant.now(clock);
        if (order.getStatus() != EscrowStatus.HELD || order.getDeliveryDeadline().isAfter(now)) {
            return false;
        }
        refund(order, SYSTEM, "Auto-refund: seller did not ship before the deadline");
        return true;
    }

    /**
     * Buyer neither confirmed nor disputed in time: pay the seller.
     * Same re-check as above: the buyer may have confirmed or disputed in the meantime.
     */
    @Transactional
    public boolean autoReleaseIfExpired(String orderId) {
        EscrowOrder order = load(orderId);
        Instant now = Instant.now(clock);
        if (order.getStatus() != EscrowStatus.SHIPPED || order.getAutoReleaseAt().isAfter(now)) {
            return false;
        }
        release(order, SYSTEM, "Auto-release: buyer did not respond in time");
        return true;
    }

    // ───────────────────────── Reads ─────────────────────────

    public EscrowOrder get(String orderId, String userId) {
        requireUserId(userId);
        EscrowOrder order = load(orderId);
        if (!isParty(order, userId) && !isAdmin(userId)) {
            throw new ForbiddenException("You are not part of this order");
        }
        return order;
    }

    public List<EscrowOrder> listForUser(String userId) {
        requireUserId(userId);
        return orderRepository.findByBuyerIdOrSellerIdOrderByCreatedAtDesc(userId, userId);
    }

    public List<EscrowOrder> listDisputed(String userId) {
        requireAdmin(userId);
        return orderRepository.findByStatusOrderByUpdatedAtAsc(EscrowStatus.DISPUTED);
    }

    // ───────────────────────── Money movement ─────────────────────────

    private EscrowOrder release(EscrowOrder order, String actor, String note) {
        User seller = userRepository.findById(order.getSellerId())
                .orElseThrow(() -> new NotFoundException("Seller not found: " + order.getSellerId()));
        order.moveTo(EscrowStatus.RELEASED, actor, Instant.now(clock), note);
        seller.setBalance(seller.getBalance().add(order.getAmount()));
        userRepository.save(seller);
        return orderRepository.save(order);
    }

    private EscrowOrder refund(EscrowOrder order, String actor, String note) {
        User buyer = userRepository.findById(order.getBuyerId())
                .orElseThrow(() -> new NotFoundException("Buyer not found: " + order.getBuyerId()));
        order.moveTo(EscrowStatus.REFUNDED, actor, Instant.now(clock), note);
        buyer.setBalance(buyer.getBalance().add(order.getAmount()));
        userRepository.save(buyer);
        return orderRepository.save(order);
    }

    // ───────────────────────── Checks ─────────────────────────

    private EscrowOrder load(String orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Escrow order not found: " + orderId));
    }

    private void requireBuyer(EscrowOrder order, String userId) {
        requireUserId(userId);
        if (!order.getBuyerId().equals(userId)) {
            throw new ForbiddenException("Only the buyer can do this");
        }
    }

    private void requireSeller(EscrowOrder order, String userId) {
        requireUserId(userId);
        if (!order.getSellerId().equals(userId)) {
            throw new ForbiddenException("Only the seller can do this");
        }
    }

    private void requireParty(EscrowOrder order, String userId) {
        requireUserId(userId);
        if (!isParty(order, userId)) {
            throw new ForbiddenException("Only the buyer or seller can do this");
        }
    }

    private void requireAdmin(String userId) {
        requireUserId(userId);
        if (!isAdmin(userId)) {
            throw new ForbiddenException("Only an admin can do this");
        }
    }

    private boolean isParty(EscrowOrder order, String userId) {
        return order.getBuyerId().equals(userId) || order.getSellerId().equals(userId);
    }

    private boolean isAdmin(String userId) {
        return properties.adminId().equals(userId);
    }

    private static void requireUserId(String userId) {
        if (isBlank(userId)) {
            throw new IllegalArgumentException("X-User-Id header is required");
        }
    }

    private BigDecimal validate(String buyerId, CreateEscrowRequest request) {
        if (request == null || isBlank(request.sellerId())) {
            throw new IllegalArgumentException("sellerId is required");
        }
        if (request.sellerId().equals(buyerId)) {
            throw new IllegalArgumentException("Buyer and seller must be different");
        }
        if (request.description() != null && request.description().length() > MAX_DESCRIPTION) {
            throw new IllegalArgumentException("Description can be at most " + MAX_DESCRIPTION + " characters");
        }
        BigDecimal amount = request.amount();
        if (amount == null || amount.signum() <= 0) {
            throw new IllegalArgumentException("Amount must be greater than 0");
        }
        if (amount.stripTrailingZeros().scale() > 2) {
            throw new IllegalArgumentException("Amount can have at most 2 decimal places");
        }
        return amount.setScale(2, RoundingMode.UNNECESSARY);
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
