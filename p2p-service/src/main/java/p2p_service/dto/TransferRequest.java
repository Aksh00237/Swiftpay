package p2p_service.dto;

import java.math.BigDecimal;

public record TransferRequest(String senderId, String receiverId, BigDecimal amount) {
}
