package escrow_service.exception;

/**
 * The requested action isn't allowed in the order's current status (e.g. confirming an order
 * that was already released). Returned as 409 Conflict.
 */
public class InvalidTransitionException extends RuntimeException {
    public InvalidTransitionException(String message) {
        super(message);
    }
}
