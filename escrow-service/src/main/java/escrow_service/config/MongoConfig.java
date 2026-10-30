package escrow_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.MongoTransactionManager;

import java.time.Clock;

@Configuration
public class MongoConfig {

    // Enables @Transactional for MongoDB. Requires MongoDB running as a replica set (see README).
    @Bean
    public MongoTransactionManager transactionManager(MongoDatabaseFactory dbFactory) {
        return new MongoTransactionManager(dbFactory);
    }

    // Injected instead of calling Instant.now() directly, so tests can control time
    @Bean
    public Clock clock() {
        return Clock.systemUTC();
    }
}
