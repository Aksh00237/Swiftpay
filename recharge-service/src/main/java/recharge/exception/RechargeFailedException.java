package recharge.exception;

import lombok.Getter;

@Getter
public class RechargeFailedException extends RuntimeException {

    private final String rechargeId;

    public RechargeFailedException(String message, String rechargeId) {
        super(message);
        this.rechargeId = rechargeId;
    }
}
