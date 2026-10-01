package recharge.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import recharge.dto.RechargeRequest;
import recharge.model.Recharge;
import recharge.service.RechargeService;

@RestController
@RequestMapping("/recharge")
@CrossOrigin
@RequiredArgsConstructor
public class RechargeController {

    private final RechargeService rechargeService;

    @PostMapping("/do")
    public ResponseEntity<Recharge> recharge(@RequestBody RechargeRequest request) {
        return ResponseEntity.ok(rechargeService.doRecharge(request));
    }
}
