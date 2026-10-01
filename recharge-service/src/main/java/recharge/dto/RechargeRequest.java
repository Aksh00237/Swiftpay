package recharge.dto;

import java.math.BigDecimal;

public record RechargeRequest(String mobileNumber, String operator, BigDecimal amount) {
}
