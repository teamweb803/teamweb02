package com.example.ikea.controller;

import com.example.ikea.dto.*;
import com.example.ikea.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payment")
public class PaymentController {

    private final PaymentService paymentService;
    
    //토스 결제 확인
    @PostMapping("/confirm/toss")
    public ResponseEntity<PaymentResponseDto> confirmToss(
            @RequestParam Long memberId,
            @RequestBody @Valid TossConfirmRequestDto dto) {
        return ResponseEntity.ok(paymentService.confirmTossPayment(memberId, dto));
    }
    
    //카카오 결제 준비
    @PostMapping("/kakao/ready")
    public ResponseEntity<KakaoReadyResponseDto> readyKakao(
            @RequestParam Long memberId,
            @RequestBody @Valid KakaoReadyRequestDto dto) {
        return ResponseEntity.ok(paymentService.kakaoReady(memberId, dto));
    }
    
    //카카오 결제 확인
    @PostMapping("/confirm/kakao")
    public ResponseEntity<PaymentResponseDto> confirmKakao (
            @RequestParam Long memberId,
            @RequestBody @Valid KakaoConfirmRequestDto dto) {
        return ResponseEntity.ok(paymentService.confirmKakaoPayment(memberId, dto));
    }
    
    //결제 취소
    @PatchMapping("/{orderId}/cancel")
    public ResponseEntity<Void> cancelPayment(
            @PathVariable Long orderId,
            @RequestParam Long memberId,
            @RequestParam String reason) {
        paymentService.cancelPayment(orderId, memberId, reason);
        return ResponseEntity.ok().build();
    }

    
    //내 결제 목록
    @GetMapping("/my/{memberId}")
    public ResponseEntity<List<PaymentResponseDto>> getMyPaymentList(
            @PathVariable Long memberId) {
        return ResponseEntity.ok(paymentService.getMyPaymentList(memberId));
    }
}
