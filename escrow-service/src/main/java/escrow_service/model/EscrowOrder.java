package escrow_service.model;

import escrow_service.exception.InvalidTransitionException;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * A buyer's payment that is held by the platform until the seller delivers.
 * While status is HELD/SHIPPED/DISPUTED, the amount has left the buyer's wallet
 * but has not reached the seller: this document is where the money "sits".
 */
@Data
@Document(collection = "escrow_orders")
public class EscrowOrder {

    @Id
    private String id;

    private String buyerId;
    private String sellerId;
    private String description;

    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal amount;

    private EscrowStatus status;

    private Instant createdAt;
    private Instant updatedAt;
    /** Seller must ship before this, otherwise the buyer is auto-refunded. */
    private Instant deliveryDeadline;
    /** Set when shipped. If the buyer neither confirms nor disputes by then, the seller is auto-paid. */
    private Instant autoReleaseAt;

    private String disputeReason;
    private String raisedBy;

    /** Client-generated key. A retried create with the same key returns the same order instead of charging twice. */
    @Indexed(unique = true, sparse = true)
    private String idempotencyKey;

    private List<StatusChange> history = new ArrayList<>();

    // Optimistic locking: if the buyer confirms at the same moment the scheduler auto-releases,
    // only one of the two writes succeeds, so the seller can never be paid twice
    @Version
    private Long version;

    /**
     * The only way to change status. Rejects any move the state machine doesn't allow
     * and records the change in the audit trail.
     */
    public void moveTo(EscrowStatus next, String actor, Instant at, String note) {
        if (!status.canMoveTo(next)) {
            throw new InvalidTransitionException("Cannot move order from " + status + " to " + next);
        }
        history.add(new StatusChange(status, next, actor, at, note));
        status = next;
        updatedAt = at;
    }
}
