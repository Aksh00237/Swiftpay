package p2m_service.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import p2m_service.dto.PaymentRequest;
import p2m_service.model.MerchantTransaction;
import p2m_service.service.MerchantService;

@RestController
@RequestMapping("/p2m")
@CrossOrigin
@RequiredArgsConstructor
public class MerchantController {

    private final MerchantService merchantService;

    @PostMapping("/pay")
    public ResponseEntity<MerchantTransaction> pay(@RequestBody PaymentRequest request) {
        return ResponseEntity.ok(merchantService.pay(request));
    }
}
