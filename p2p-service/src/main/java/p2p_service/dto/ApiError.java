package p2p_service.dto;

public record ApiError(String error, String message, String transactionId) {

    public static ApiError of(String error, String message) {
        return new ApiError(error, message, null);
    }
}
