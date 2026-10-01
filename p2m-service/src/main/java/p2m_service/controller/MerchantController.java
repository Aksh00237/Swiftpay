package p2m_service.controller;

import p2m_service.model.MerchantTransaction;
import p2m_service.service.MerchantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/p2m")
@CrossOrigin
public class MerchantController {

    @Autowired
    private MerchantService service;

    @PostMapping("/pay")
    public MerchantTransaction pay(@RequestBody MerchantTransaction txn) {
        return service.pay(txn);
    }
}