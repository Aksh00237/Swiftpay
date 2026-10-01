package p2p_service.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import p2p_service.dto.TransferRequest;
import p2p_service.model.Transaction;
import p2p_service.service.TransactionService;

@RestController
@RequestMapping("/p2p")
@CrossOrigin
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping("/sendMoney")
    public ResponseEntity<Transaction> sendMoney(@RequestBody TransferRequest request) {
        return ResponseEntity.ok(transactionService.sendMoney(request));
    }
}
