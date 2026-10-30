package escrow_service.exception;

/**
 * The caller is not allowed to act on this order (e.g. the seller trying to confirm delivery).
 * Returned as 403 Forbidden.
 */
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }
}
