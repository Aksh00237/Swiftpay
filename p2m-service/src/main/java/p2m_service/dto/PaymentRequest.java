package p2m_service.dto;

import java.math.BigDecimal;

public record PaymentRequest(String userId, String merchantId, BigDecimal amount) {
}
