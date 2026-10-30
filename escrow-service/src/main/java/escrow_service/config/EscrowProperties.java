package escrow_service.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

/**
 * Timeouts and admin id, read from application.properties (escrow.*).
 */
@ConfigurationProperties(prefix = "escrow")
public record EscrowProperties(
        Duration deliveryWindow,
        Duration confirmWindow,
        String adminId
) {
}
