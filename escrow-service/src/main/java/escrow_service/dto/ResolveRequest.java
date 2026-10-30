package escrow_service.dto;

/**
 * Admin decision on a disputed order.
 * outcome: "REFUND" (money back to buyer) or "RELEASE" (money to seller).
 */
public record ResolveRequest(String outcome, String note) {
}
