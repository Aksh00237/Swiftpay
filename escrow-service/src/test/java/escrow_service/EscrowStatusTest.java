package escrow_service;

import escrow_service.exception.InvalidTransitionException;
import escrow_service.model.EscrowOrder;
import escrow_service.model.EscrowStatus;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static escrow_service.model.EscrowStatus.DISPUTED;
import static escrow_service.model.EscrowStatus.HELD;
import static escrow_service.model.EscrowStatus.REFUNDED;
import static escrow_service.model.EscrowStatus.RELEASED;
import static escrow_service.model.EscrowStatus.SHIPPED;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class EscrowStatusTest {

    @Test
    void allowsOnlyTheDocumentedMoves() {
        assertThat(HELD.allowedNext()).containsExactlyInAnyOrder(SHIPPED, REFUNDED);
        assertThat(SHIPPED.allowedNext()).containsExactlyInAnyOrder(RELEASED, DISPUTED);
        assertThat(DISPUTED.allowedNext()).containsExactlyInAnyOrder(RELEASED, REFUNDED);
    }

    @Test
    void finalStatesCannotMoveAnywhere() {
        for (EscrowStatus next : EscrowStatus.values()) {
            assertThat(RELEASED.canMoveTo(next)).isFalse();
            assertThat(REFUNDED.canMoveTo(next)).isFalse();
        }
    }

    @Test
    void cannotSkipShippingAndPayTheSellerDirectly() {
        assertThat(HELD.canMoveTo(RELEASED)).isFalse();
    }

    @Test
    void moveToRecordsHistoryAndRejectsIllegalJumps() {
        EscrowOrder order = new EscrowOrder();
        order.setStatus(HELD);
        Instant t = Instant.parse("2026-10-30T10:00:00Z");

        order.moveTo(SHIPPED, "seller1", t, "shipped");

        assertThat(order.getStatus()).isEqualTo(SHIPPED);
        assertThat(order.getHistory()).hasSize(1);
        assertThat(order.getHistory().get(0).from()).isEqualTo(HELD);
        assertThat(order.getHistory().get(0).actor()).isEqualTo("seller1");

        assertThatThrownBy(() -> order.moveTo(REFUNDED, "buyer1", t, "nope"))
                .isInstanceOf(InvalidTransitionException.class);
        assertThat(order.getStatus()).isEqualTo(SHIPPED);
        assertThat(order.getHistory()).hasSize(1);
    }
}
