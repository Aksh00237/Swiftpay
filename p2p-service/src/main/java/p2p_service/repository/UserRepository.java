package p2p_service.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import p2p_service.model.User;

public interface UserRepository extends MongoRepository<User, String> {
}
