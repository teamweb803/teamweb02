package com.example.ikea.controller;

import com.example.ikea.dto.OrderRequestDto;
import com.example.ikea.dto.OrderResponseDto;
import com.example.ikea.service.MemberService;
import com.example.ikea.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/order")
public class OrderController {

    private final OrderService orderService;
    private final MemberService memberService;

    //주문 목록 조회(내 주문 내역)
    @GetMapping
    public ResponseEntity<List<OrderResponseDto>> getOrderList(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long memberId = memberService.getMemberIdByLoginId(userDetails.getUsername());
        return ResponseEntity.ok(orderService.getOrderList(memberId));
    }

    //주문 상세 조회
    @GetMapping("/detail/{orderId}")
    public ResponseEntity<OrderResponseDto> getDetailOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long orderId) {
        Long memberId = memberService.getMemberIdByLoginId(userDetails.getUsername());
        return ResponseEntity.ok(orderService.getDetailOrder(orderId, memberId));
    }

    //주문 생성 (장바구니 -> 주문)
    @PostMapping
    public ResponseEntity<Long> createOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @Valid OrderRequestDto dto) {
        Long memberId = memberService.getMemberIdByLoginId(userDetails.getUsername());
        return ResponseEntity.ok(orderService.createOrder(memberId, dto));
    }

    //주문 취소
    @DeleteMapping("/{orderId}")
    public ResponseEntity<Void> cancelOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long orderId) {
        Long memberId = memberService.getMemberIdByLoginId(userDetails.getUsername());
        orderService.cancelOrder(orderId, memberId);
        return ResponseEntity.ok().build();
    }
}
