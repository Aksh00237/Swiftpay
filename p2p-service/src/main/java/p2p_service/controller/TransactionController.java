package p2p_service.controller;

import p2p_service.model.Transaction;
import p2p_service.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/p2p")
@CrossOrigin
public class TransactionController {

    @Autowired
    private TransactionService service;

    @PostMapping("/sendMoney")
    public Transaction sendMoney(@RequestBody Transaction txn) {
        return service.sendMoney(txn);
    }
}