package p2p_service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import p2p_service.dto.TransferRequest;
import p2p_service.exception.NotFoundException;
import p2p_service.exception.PaymentFailedException;
import p2p_service.model.Transaction;
import p2p_service.model.TransactionStatus;
import p2p_service.model.User;
import p2p_service.repository.TransactionRepository;
import p2p_service.repository.UserRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    /**
     * Debit sender and credit receiver atomically. Either both balance updates and the
     * SUCCESS record are committed, or none of them are.
     */
    @Transactional(noRollbackFor = PaymentFailedException.class)
    public Transaction sendMoney(TransferRequest request) {
        BigDecimal amount = validate(request);

        User sender = userRepository.findById(request.senderId())
                .orElseThrow(() -> new NotFoundException("Sender not found: " + request.senderId()));
        User receiver = userRepository.findById(request.receiverId())
                .orElseThrow(() -> new NotFoundException("Receiver not found: " + request.receiverId()));

        Transaction txn = new Transaction();
        txn.setSenderId(sender.getId());
        txn.setReceiverId(receiver.getId());
        txn.setAmount(amount);
        txn.setCreatedAt(Instant.now());

        if (sender.getBalance().compareTo(amount) < 0) {
            txn.setStatus(TransactionStatus.FAILED);
            txn.setFailureReason("INSUFFICIENT_BALANCE");
            Transaction failed = transactionRepository.save(txn);
            throw new PaymentFailedException("Insufficient balance", failed.getId());
        }

        sender.setBalance(sender.getBalance().subtract(amount));
        receiver.setBalance(receiver.getBalance().add(amount));
        userRepository.save(sender);
        userRepository.save(receiver);

        txn.setStatus(TransactionStatus.SUCCESS);
        return transactionRepository.save(txn);
    }

    private BigDecimal validate(TransferRequest request) {
        if (request == null || isBlank(request.senderId()) || isBlank(request.receiverId())) {
            throw new IllegalArgumentException("senderId and receiverId are required");
        }
        if (request.senderId().equals(request.receiverId())) {
            throw new IllegalArgumentException("Sender and receiver must be different");
        }
        BigDecimal amount = request.amount();
        if (amount == null || amount.signum() <= 0) {
            throw new IllegalArgumentException("Amount must be greater than 0");
        }
        if (amount.stripTrailingZeros().scale() > 2) {
            throw new IllegalArgumentException("Amount can have at most 2 decimal places");
        }
        return amount.setScale(2, RoundingMode.UNNECESSARY);
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
