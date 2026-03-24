package com.example.ikea.controller;

import com.example.ikea.dto.OrderRequestDto;
import com.example.ikea.dto.OrderResponseDto;
import com.example.ikea.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/order")
public class OrderController {

    private final OrderService orderService;

    //주문 목록 조회(내 주문 내역)
    @GetMapping("/{memberId}")
    public ResponseEntity<List<OrderResponseDto>> getOrderList(
            @PathVariable Long memberId) {
        return ResponseEntity.ok(orderService.getOrderList(memberId));
    }

    //주문 상세 조회
    @GetMapping("/detail/{orderId}")
    public ResponseEntity<OrderResponseDto> getDetailOrder(
            @PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getDetailOrder(orderId));
    }

    //주문 생성 (장바구니 -> 주문)
    @PostMapping("/{memberId}")
    public ResponseEntity<Long> createOrder(@PathVariable Long memberId,
                                            @RequestParam @Valid OrderRequestDto dto) {
        return ResponseEntity.ok(orderService.createOrder(memberId, dto));
    }

    //주문 취소
    @DeleteMapping("/{orderId}")
    public ResponseEntity<Void> cancelOrder(@PathVariable Long orderId) {
        orderService.cancelOrder(orderId);
        return ResponseEntity.ok().build();
    }
}
