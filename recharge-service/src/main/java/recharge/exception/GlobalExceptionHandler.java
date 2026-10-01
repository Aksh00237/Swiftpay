package recharge.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import recharge.dto.ApiError;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RechargeFailedException.class)
    public ResponseEntity<ApiError> rechargeFailed(RechargeFailedException ex) {
        return ResponseEntity.badRequest()
                .body(new ApiError("RECHARGE_FAILED", ex.getMessage(), ex.getRechargeId()));
    }
}
