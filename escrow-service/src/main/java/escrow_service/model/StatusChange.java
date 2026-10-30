package escrow_service.model;

import java.time.Instant;

/**
 * One entry in an order's audit trail: who moved it, from where to where, when and why.
 * actor is a user id, the admin id, or "system" for scheduler actions.
 */
public record StatusChange(
        EscrowStatus from,
        EscrowStatus to,
        String actor,
        Instant at,
        String note
) {
}
