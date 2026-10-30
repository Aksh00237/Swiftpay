package escrow_service.controller;

import escrow_service.dto.CreateEscrowRequest;
import escrow_service.dto.DisputeRequest;
import escrow_service.dto.ResolveRequest;
import escrow_service.model.EscrowOrder;
import escrow_service.service.EscrowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * The caller's identity comes from the X-User-Id header (there is no login yet), and the
 * service checks that this user is allowed to act on the order: buyer, seller or admin.
 */
@RestController
@RequestMapping("/escrow")
@CrossOrigin
@RequiredArgsConstructor
public class EscrowController {

    private static final String USER = "X-User-Id";

    private final EscrowService escrowService;

    @PostMapping
    public ResponseEntity<EscrowOrder> create(@RequestHeader(USER) String userId,
                                              @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
                                              @RequestBody CreateEscrowRequest request) {
        return ResponseEntity.ok(escrowService.create(userId, idempotencyKey, request));
    }

    @GetMapping
    public List<EscrowOrder> myOrders(@RequestHeader(USER) String userId) {
        return escrowService.listForUser(userId);
    }

    @GetMapping("/disputed")
    public List<EscrowOrder> disputed(@RequestHeader(USER) String userId) {
        return escrowService.listDisputed(userId);
    }

    @GetMapping("/{id}")
    public EscrowOrder get(@RequestHeader(USER) String userId, @PathVariable String id) {
        return escrowService.get(id, userId);
    }

    @PostMapping("/{id}/ship")
    public EscrowOrder ship(@RequestHeader(USER) String userId, @PathVariable String id) {
        return escrowService.ship(id, userId);
    }

    @PostMapping("/{id}/cancel")
    public EscrowOrder cancel(@RequestHeader(USER) String userId, @PathVariable String id) {
        return escrowService.cancel(id, userId);
    }

    @PostMapping("/{id}/confirm")
    public EscrowOrder confirm(@RequestHeader(USER) String userId, @PathVariable String id) {
        return escrowService.confirm(id, userId);
    }

    @PostMapping("/{id}/dispute")
    public EscrowOrder dispute(@RequestHeader(USER) String userId, @PathVariable String id,
                               @RequestBody DisputeRequest request) {
        return escrowService.dispute(id, userId, request);
    }

    @PostMapping("/{id}/resolve")
    public EscrowOrder resolve(@RequestHeader(USER) String userId, @PathVariable String id,
                               @RequestBody ResolveRequest request) {
        return escrowService.resolve(id, userId, request);
    }
}
