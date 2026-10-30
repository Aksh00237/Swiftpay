package escrow_service.dto;

import java.math.BigDecimal;

public record CreateEscrowRequest(String sellerId, BigDecimal amount, String description) {
}
