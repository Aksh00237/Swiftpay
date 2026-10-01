package p2p_service.exception;

import lombok.Getter;

/**
 * Business failure (e.g. insufficient balance). The FAILED transaction is still
 * persisted for the audit trail, so this exception must not roll back the transaction.
 */
@Getter
public class PaymentFailedException extends RuntimeException {

    private final String transactionId;

    public PaymentFailedException(String message, String transactionId) {
        super(message);
        this.transactionId = transactionId;
    }
}
