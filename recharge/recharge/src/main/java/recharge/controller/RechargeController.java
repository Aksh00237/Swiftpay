package recharge.controller;

import recharge.model.Recharge;
import recharge.service.RechargeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/recharge")
@CrossOrigin
public class RechargeController {

    @Autowired
    private RechargeService service;

    @PostMapping("/do")
    public Recharge recharge(@RequestBody Recharge recharge) {
        return service.doRecharge(recharge);
    }
}