package escrow_service.scheduler;

import escrow_service.model.EscrowOrder;
import escrow_service.model.EscrowStatus;
import escrow_service.repository.EscrowOrderRepository;
import escrow_service.service.EscrowService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.function.Predicate;

/**
 * Enforces the escrow timeouts so money never stays stuck:
 *  - HELD past its delivery deadline   -> refund the buyer
 *  - SHIPPED past its auto-release time -> pay the seller
 *
 * Each order is handled in its own transaction (via EscrowService), so one failure
 * doesn't block the others, and the service re-checks the status before moving money.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class EscrowScheduler {

    private final EscrowOrderRepository orderRepository;
    private final EscrowService escrowService;
    private final Clock clock;

    @Scheduled(fixedDelayString = "${escrow.scheduler-delay-ms:60000}", initialDelay = 10_000)
    public void processExpiredOrders() {
        Instant now = Instant.now(clock);

        List<EscrowOrder> unshipped = orderRepository.findByStatusAndDeliveryDeadlineBefore(EscrowStatus.HELD, now);
        int refunded = run(unshipped, escrowService::autoRefundIfExpired, "auto-refund");

        List<EscrowOrder> unconfirmed = orderRepository.findByStatusAndAutoReleaseAtBefore(EscrowStatus.SHIPPED, now);
        int released = run(unconfirmed, escrowService::autoReleaseIfExpired, "auto-release");

        if (refunded > 0 || released > 0) {
            log.info("Escrow scheduler: {} auto-refunded, {} auto-released", refunded, released);
        }
    }

    private int run(List<EscrowOrder> orders, Predicate<String> action, String label) {
        int done = 0;
        for (EscrowOrder order : orders) {
            try {
                if (action.test(order.getId())) {
                    done++;
                }
            } catch (RuntimeException ex) {
                // Usually a concurrent update (buyer/seller acted at the same moment). The next run re-checks it.
                log.warn("Escrow {} skipped for order {}: {}", label, order.getId(), ex.getMessage());
            }
        }
        return done;
    }
}
