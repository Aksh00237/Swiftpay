package recharge.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import recharge.dto.RechargeRequest;
import recharge.exception.RechargeFailedException;
import recharge.model.Recharge;
import recharge.model.RechargeStatus;
import recharge.repository.RechargeRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class RechargeService {

    private static final Set<String> SUPPORTED_OPERATORS = Set.of("jio", "airtel", "vi");
    private static final Pattern INDIAN_MOBILE = Pattern.compile("[6-9]\\d{9}");

    private final RechargeRepository rechargeRepository;

    public Recharge doRecharge(RechargeRequest request) {
        Recharge recharge = new Recharge();
        recharge.setCreatedAt(Instant.now());

        if (request == null) {
            return fail(recharge, "INVALID_REQUEST", "Request body is required");
        }
        recharge.setMobileNumber(request.mobileNumber());
        recharge.setOperator(request.operator() == null ? null : request.operator().trim().toLowerCase(Locale.ROOT));
        recharge.setAmount(request.amount());

        if (request.mobileNumber() == null || !INDIAN_MOBILE.matcher(request.mobileNumber()).matches()) {
            return fail(recharge, "INVALID_MOBILE", "Enter a valid 10-digit mobile number");
        }
        if (recharge.getOperator() == null || !SUPPORTED_OPERATORS.contains(recharge.getOperator())) {
            return fail(recharge, "INVALID_OPERATOR", "Supported operators: jio, airtel, vi");
        }
        BigDecimal amount = request.amount();
        if (amount == null || amount.signum() <= 0 || amount.stripTrailingZeros().scale() > 2) {
            return fail(recharge, "INVALID_AMOUNT", "Amount must be greater than 0 with at most 2 decimal places");
        }

        recharge.setAmount(amount.setScale(2, RoundingMode.UNNECESSARY));
        recharge.setStatus(RechargeStatus.SUCCESS);
        return rechargeRepository.save(recharge);
    }

    // Failed attempts are persisted too, so there is an audit trail of every request
    private Recharge fail(Recharge recharge, String reason, String message) {
        recharge.setStatus(RechargeStatus.FAILED);
        recharge.setFailureReason(reason);
        Recharge saved = rechargeRepository.save(recharge);
        throw new RechargeFailedException(message, saved.getId());
    }
}
