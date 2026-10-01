package p2m_service.service;

import p2m_service.model.*;
import p2m_service.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MerchantService {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private MerchantRepository merchantRepo;

    @Autowired
    private MerchantTxnRepository txnRepo;

    double platformBalance = 0;

    public MerchantTransaction pay(MerchantTransaction txn) {

        User user = userRepo.findById(txn.getUserId()).orElseThrow();
        Merchant merchant = merchantRepo.findById(txn.getMerchantId()).orElseThrow();

        double amount = txn.getAmount();
        double commission = 10; // fixed ₹10
        double finalAmount = amount - commission;

        // ❌ insufficient balance
        if (user.getBalance() < amount) {
            txn.setStatus("FAILED");
            return txn;
        }

        // ✅ update balances
        user.setBalance(user.getBalance() - amount);
        merchant.setBalance(merchant.getBalance() + finalAmount);
        platformBalance += commission;

        userRepo.save(user);
        merchantRepo.save(merchant);

        txn.setCommission(commission);
        txn.setFinalAmount(finalAmount);
        txn.setStatus("SUCCESS");

        return txnRepo.save(txn);
    }
}