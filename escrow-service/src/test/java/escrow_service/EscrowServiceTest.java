package escrow_service;

import escrow_service.config.EscrowProperties;
import escrow_service.dto.CreateEscrowRequest;
import escrow_service.dto.DisputeRequest;
import escrow_service.dto.ResolveRequest;
import escrow_service.exception.ForbiddenException;
import escrow_service.exception.InvalidTransitionException;
import escrow_service.exception.PaymentFailedException;
import escrow_service.model.EscrowOrder;
import escrow_service.model.EscrowStatus;
import escrow_service.model.User;
import escrow_service.repository.EscrowOrderRepository;
import escrow_service.repository.UserRepository;
import escrow_service.service.EscrowService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Business rules of escrow, tested without MongoDB: repositories are backed by in-memory maps.
 * Example from the README: Rahul (buyer) pays Priya (seller) ₹500 for a phone cover.
 */
class EscrowServiceTest {

    private static final Instant T0 = Instant.parse("2026-10-30T10:00:00Z");

    private final Map<String, User> users = new HashMap<>();
    private final Map<String, EscrowOrder> orders = new HashMap<>();
    private UserRepository userRepository;
    private EscrowOrderRepository orderRepository;
    private MutableClock clock;
    private EscrowService service;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        orderRepository = mock(EscrowOrderRepository.class);

        when(userRepository.findById(anyString())).thenAnswer(i -> Optional.ofNullable(users.get(i.<String>getArgument(0))));
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(orderRepository.findById(anyString())).thenAnswer(i -> Optional.ofNullable(orders.get(i.<String>getArgument(0))));
        when(orderRepository.findByIdempotencyKey(anyString())).thenAnswer(i -> orders.values().stream()
                .filter(o -> i.getArgument(0).equals(o.getIdempotencyKey())).findFirst());
        when(orderRepository.save(any())).thenAnswer(i -> {
            EscrowOrder o = i.getArgument(0);
            if (o.getId() == null) {
                o.setId("order" + (orders.size() + 1));
            }
            orders.put(o.getId(), o);
            return o;
        });

        users.put("rahul", wallet("rahul", "2000.00"));
        users.put("priya", wallet("priya", "300.00"));

        clock = new MutableClock(T0);
        var props = new EscrowProperties(Duration.ofDays(3), Duration.ofDays(5), "admin");
        service = new EscrowService(orderRepository, userRepository, props, clock);
    }

    // ───────── happy path ─────────

    @Test
    void fullHappyPathMovesMoneyOnlyOnConfirm() {
        EscrowOrder order = buy("500.00", "key-1");
        assertThat(order.getStatus()).isEqualTo(EscrowStatus.HELD);
        assertBalances("1500.00", "300.00"); // money left Rahul but hasn't reached Priya

        service.ship(order.getId(), "priya");
        assertBalances("1500.00", "300.00");

        EscrowOrder done = service.confirm(order.getId(), "rahul");
        assertThat(done.getStatus()).isEqualTo(EscrowStatus.RELEASED);
        assertBalances("1500.00", "800.00");
        assertThat(done.getHistory()).extracting(h -> h.to())
                .containsExactly(EscrowStatus.HELD, EscrowStatus.SHIPPED, EscrowStatus.RELEASED);
    }

    // ───────── money safety ─────────

    @Test
    void sameIdempotencyKeyDoesNotChargeTwice() {
        EscrowOrder first = buy("500.00", "double-click");
        EscrowOrder second = buy("500.00", "double-click");

        assertThat(second.getId()).isEqualTo(first.getId());
        assertThat(orders).hasSize(1);
        assertBalances("1500.00", "300.00");
    }

    @Test
    void insufficientBalanceHoldsNothing() {
        assertThatThrownBy(() -> buy("5000.00", "too-much")).isInstanceOf(PaymentFailedException.class);
        assertThat(orders).isEmpty();
        assertBalances("2000.00", "300.00");
    }

    @Test
    void confirmingTwiceDoesNotPayTwice() {
        EscrowOrder order = shippedOrder();
        service.confirm(order.getId(), "rahul");

        assertThatThrownBy(() -> service.confirm(order.getId(), "rahul"))
                .isInstanceOf(InvalidTransitionException.class);
        assertBalances("1500.00", "800.00");
    }

    // ───────── who can do what ─────────

    @Test
    void sellerCannotConfirmToPayThemselves() {
        EscrowOrder order = shippedOrder();
        assertThatThrownBy(() -> service.confirm(order.getId(), "priya")).isInstanceOf(ForbiddenException.class);
        assertBalances("1500.00", "300.00");
    }

    @Test
    void buyerCannotMarkShipped() {
        EscrowOrder order = buy("500.00", "k");
        assertThatThrownBy(() -> service.ship(order.getId(), "rahul")).isInstanceOf(ForbiddenException.class);
    }

    @Test
    void strangerCannotDisputeOrView() {
        users.put("amit", wallet("amit", "0.00"));
        EscrowOrder order = shippedOrder();
        assertThatThrownBy(() -> service.dispute(order.getId(), "amit", new DisputeRequest("x")))
                .isInstanceOf(ForbiddenException.class);
        assertThatThrownBy(() -> service.get(order.getId(), "amit")).isInstanceOf(ForbiddenException.class);
    }

    @Test
    void onlyAdminCanResolve() {
        EscrowOrder order = shippedOrder();
        service.dispute(order.getId(), "rahul", new DisputeRequest("Damaged product"));
        assertThatThrownBy(() -> service.resolve(order.getId(), "rahul", new ResolveRequest("REFUND", null)))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void cannotConfirmBeforeShipping() {
        EscrowOrder order = buy("500.00", "k");
        assertThatThrownBy(() -> service.confirm(order.getId(), "rahul"))
                .isInstanceOf(InvalidTransitionException.class);
        assertBalances("1500.00", "300.00");
    }

    // ───────── disputes ─────────

    @Test
    void disputeFreezesMoneyUntilAdminRefunds() {
        EscrowOrder order = shippedOrder();
        service.dispute(order.getId(), "rahul", new DisputeRequest("Damaged product"));

        // Even after the confirm window, a disputed order is not auto-released
        clock.advance(Duration.ofDays(10));
        assertThat(service.autoReleaseIfExpired(order.getId())).isFalse();
        assertBalances("1500.00", "300.00");

        EscrowOrder resolved = service.resolve(order.getId(), "admin", new ResolveRequest("REFUND", "Photos show damage"));
        assertThat(resolved.getStatus()).isEqualTo(EscrowStatus.REFUNDED);
        assertBalances("2000.00", "300.00");
    }

    @Test
    void disputeNeedsAReason() {
        EscrowOrder order = shippedOrder();
        assertThatThrownBy(() -> service.dispute(order.getId(), "rahul", new DisputeRequest("  ")))
                .isInstanceOf(IllegalArgumentException.class);
    }

    // ───────── timeouts ─────────

    @Test
    void sellerWhoNeverShipsGetsBuyerAutoRefunded() {
        EscrowOrder order = buy("500.00", "k");

        clock.advance(Duration.ofDays(2));
        assertThat(service.autoRefundIfExpired(order.getId())).isFalse(); // deadline not reached yet

        clock.advance(Duration.ofDays(2));
        assertThat(service.autoRefundIfExpired(order.getId())).isTrue();
        assertThat(orders.get(order.getId()).getStatus()).isEqualTo(EscrowStatus.REFUNDED);
        assertThat(lastActor(order)).isEqualTo("system");
        assertBalances("2000.00", "300.00");
    }

    @Test
    void buyerWhoNeverConfirmsGetsSellerAutoPaid() {
        EscrowOrder order = shippedOrder();

        clock.advance(Duration.ofDays(6));
        assertThat(service.autoReleaseIfExpired(order.getId())).isTrue();
        assertBalances("1500.00", "800.00");
    }

    @Test
    void schedulerDoesNothingIfBuyerConfirmedFirst() {
        EscrowOrder order = shippedOrder();
        service.confirm(order.getId(), "rahul");

        clock.advance(Duration.ofDays(6));
        assertThat(service.autoReleaseIfExpired(order.getId())).isFalse();
        assertBalances("1500.00", "800.00"); // paid exactly once
    }

    @Test
    void sellerCancelRefundsImmediately() {
        EscrowOrder order = buy("500.00", "k");
        service.cancel(order.getId(), "priya");
        assertThat(orders.get(order.getId()).getStatus()).isEqualTo(EscrowStatus.REFUNDED);
        assertBalances("2000.00", "300.00");
    }

    // ───────── helpers ─────────

    private EscrowOrder buy(String amount, String key) {
        return service.create("rahul", key, new CreateEscrowRequest("priya", new BigDecimal(amount), "Custom phone cover"));
    }

    private EscrowOrder shippedOrder() {
        EscrowOrder order = buy("500.00", "k-" + orders.size());
        return service.ship(order.getId(), "priya");
    }

    private void assertBalances(String rahul, String priya) {
        assertThat(users.get("rahul").getBalance()).isEqualByComparingTo(rahul);
        assertThat(users.get("priya").getBalance()).isEqualByComparingTo(priya);
    }

    private String lastActor(EscrowOrder order) {
        var history = orders.get(order.getId()).getHistory();
        return history.get(history.size() - 1).actor();
    }

    private static User wallet(String id, String balance) {
        User u = new User();
        u.setId(id);
        u.setBalance(new BigDecimal(balance));
        return u;
    }

    /** A clock the tests can move forward to simulate days passing. */
    static class MutableClock extends Clock {
        private Instant now;

        MutableClock(Instant start) {
            this.now = start;
        }

        void advance(Duration d) {
            now = now.plus(d);
        }

        @Override
        public Instant instant() {
            return now;
        }

        @Override
        public java.time.ZoneId getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(java.time.ZoneId zone) {
            return this;
        }
    }
}
