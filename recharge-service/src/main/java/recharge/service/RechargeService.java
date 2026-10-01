package recharge.service;

import recharge.model.Recharge;
import recharge.repository.RechargeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RechargeService {

    @Autowired
    private RechargeRepository repo;

    public Recharge doRecharge(Recharge recharge) {

        // simple validation
        if (recharge.getAmount() <= 0) {
            recharge.setStatus("FAILED");
            return recharge;
        }

        // operator check
        String op = recharge.getOperator().toLowerCase();

        if (!(op.equals("jio") || op.equals("airtel") || op.equals("vi"))) {
            recharge.setStatus("INVALID_OPERATOR");
            return recharge;
        }

        recharge.setStatus("SUCCESS");

        return repo.save(recharge);
    }
}