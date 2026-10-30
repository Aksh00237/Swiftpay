package escrow_service.model;

import java.util.Set;

/**
 * Lifecycle of an escrow order. Every allowed move is listed here and nowhere else,
 * so an illegal jump (e.g. RELEASED -> REFUNDED) can't happen from any code path.
 *
 *   HELD ──ship──▶ SHIPPED ──confirm / auto-release──▶ RELEASED
 *    │                │
 *    │                └──dispute──▶ DISPUTED ──admin──▶ RELEASED or REFUNDED
 *    │
 *    └──seller cancels / delivery deadline missed──▶ REFUNDED
 */
public enum EscrowStatus {
    HELD,
    SHIPPED,
    DISPUTED,
    RELEASED,
    REFUNDED;

    public Set<EscrowStatus> allowedNext() {
        return switch (this) {
            case HELD -> Set.of(SHIPPED, REFUNDED);
            case SHIPPED -> Set.of(RELEASED, DISPUTED);
            case DISPUTED -> Set.of(RELEASED, REFUNDED);
            case RELEASED, REFUNDED -> Set.of();
        };
    }

    public boolean canMoveTo(EscrowStatus next) {
        return allowedNext().contains(next);
    }

    /** Money is still locked in escrow in these states. */
    public boolean isFundsHeld() {
        return this == HELD || this == SHIPPED || this == DISPUTED;
    }
}
