package escrow_service.repository;

import escrow_service.model.EscrowOrder;
import escrow_service.model.EscrowStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface EscrowOrderRepository extends MongoRepository<EscrowOrder, String> {

    Optional<EscrowOrder> findByIdempotencyKey(String idempotencyKey);

    // Orders where the user is either the buyer or the seller, newest first
    List<EscrowOrder> findByBuyerIdOrSellerIdOrderByCreatedAtDesc(String buyerId, String sellerId);

    List<EscrowOrder> findByStatusOrderByUpdatedAtAsc(EscrowStatus status);

    // Scheduler: seller never shipped in time
    List<EscrowOrder> findByStatusAndDeliveryDeadlineBefore(EscrowStatus status, Instant now);

    // Scheduler: buyer never confirmed or disputed in time
    List<EscrowOrder> findByStatusAndAutoReleaseAtBefore(EscrowStatus status, Instant now);
}
