package com.example.ikea.controller;

import com.example.ikea.domain.OrderStatus;
import com.example.ikea.dto.OrderResponseDto;
import com.example.ikea.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/order")
public class AdminOrderController {

    private final OrderService orderService;

    //전체 주문 조회
    @GetMapping
    public ResponseEntity<List<OrderResponseDto>> getOrderList() {
        return ResponseEntity.ok(orderService.getAllOrderList());
    }

    //상태별 주문 조회
    @GetMapping("/status")
    public ResponseEntity<List<OrderResponseDto>> getOrderListByStatus(
            @RequestParam OrderStatus status) {
        return ResponseEntity.ok(orderService.getOrderListByStatus(status));
    }

    //주문 상태 변경
    @PatchMapping("/{orderId}/status")
    public ResponseEntity<Void> updateOrderStatus(@PathVariable Long orderId,
                                                  @RequestParam @Valid OrderStatus status) {
        orderService.updateOrderStatus(status, orderId);
        return ResponseEntity.ok().build();
    }

    //대시보드용 주문 수
    @GetMapping("/count")
    public ResponseEntity<Long> getOrderCount() {
        return ResponseEntity.ok(orderService.getOrderCount());
    }
}
