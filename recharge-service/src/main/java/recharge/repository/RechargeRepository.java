package recharge.repository;

import recharge.model.Recharge;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface RechargeRepository extends MongoRepository<Recharge, String> {
}