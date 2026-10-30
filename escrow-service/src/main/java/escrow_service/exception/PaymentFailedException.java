package escrow_service.exception;

/**
 * Business failure while funding an escrow (e.g. insufficient balance). Returned as 422.
 */
public class PaymentFailedException extends RuntimeException {
    public PaymentFailedException(String message) {
        super(message);
    }
}
