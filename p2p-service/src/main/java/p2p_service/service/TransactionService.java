package p2p_service.service;

import p2p_service.model.Transaction;
import p2p_service.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository repo;

    public Transaction sendMoney(Transaction txn) {
        txn.setStatus("SUCCESS");
        return repo.save(txn);
    }
}