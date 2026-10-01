package p2m_service.repository;

import p2m_service.model.MerchantTransaction;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MerchantTxnRepository extends MongoRepository<MerchantTransaction, String> {
}