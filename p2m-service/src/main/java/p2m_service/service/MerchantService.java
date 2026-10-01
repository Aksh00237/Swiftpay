package p2m_service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import p2m_service.dto.PaymentRequest;
import p2m_service.exception.NotFoundException;
import p2m_service.exception.PaymentFailedException;
import p2m_service.model.Merchant;
import p2m_service.model.MerchantTransaction;
import p2m_service.model.TransactionStatus;
import p2m_service.model.User;
import p2m_service.repository.MerchantRepository;
import p2m_service.repository.MerchantTxnRepository;
import p2m_service.repository.UserRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class MerchantService {

    static final BigDecimal COMMISSION = new BigDecimal("10.00");

    private final UserRepository userRepository;
    private final MerchantRepository merchantRepository;
    private final MerchantTxnRepository txnRepository;

    /**
     * Debit the user and credit the merchant (minus commission) atomically.
     */
    @Transactional(noRollbackFor = PaymentFailedException.class)
    public MerchantTransaction pay(PaymentRequest request) {
        BigDecimal amount = validate(request);

        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new NotFoundException("User not found: " + request.userId()));
        Merchant merchant = merchantRepository.findById(request.merchantId())
                .orElseThrow(() -> new NotFoundException("Merchant not found: " + request.merchantId()));

        BigDecimal finalAmount = amount.subtract(COMMISSION);

        MerchantTransaction txn = new MerchantTransaction();
        txn.setUserId(user.getId());
        txn.setMerchantId(merchant.getId());
        txn.setAmount(amount);
        txn.setCommission(COMMISSION);
        txn.setFinalAmount(finalAmount);
        txn.setCreatedAt(Instant.now());

        if (user.getBalance().compareTo(amount) < 0) {
            txn.setStatus(TransactionStatus.FAILED);
            txn.setFailureReason("INSUFFICIENT_BALANCE");
            MerchantTransaction failed = txnRepository.save(txn);
            throw new PaymentFailedException("Insufficient balance", failed.getId());
        }

        user.setBalance(user.getBalance().subtract(amount));
        merchant.setBalance(merchant.getBalance().add(finalAmount));
        userRepository.save(user);
        merchantRepository.save(merchant);

        txn.setStatus(TransactionStatus.SUCCESS);
        return txnRepository.save(txn);
    }

    private BigDecimal validate(PaymentRequest request) {
        if (request == null || isBlank(request.userId()) || isBlank(request.merchantId())) {
            throw new IllegalArgumentException("userId and merchantId are required");
        }
        BigDecimal amount = request.amount();
        if (amount == null || amount.signum() <= 0) {
            throw new IllegalArgumentException("Amount must be greater than 0");
        }
        if (amount.stripTrailingZeros().scale() > 2) {
            throw new IllegalArgumentException("Amount can have at most 2 decimal places");
        }
        if (amount.compareTo(COMMISSION) <= 0) {
            throw new IllegalArgumentException("Amount must be greater than the commission of Rs " + COMMISSION);
        }
        return amount.setScale(2, RoundingMode.UNNECESSARY);
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
