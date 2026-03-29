package com.example.ikea.controller;

import com.example.ikea.dto.PaymentResponseDto;
import com.example.ikea.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/payment")
public class AdminPaymentController {

    private final PaymentService paymentService;

    //전체 결제 목록
    @GetMapping
    public ResponseEntity<List<PaymentResponseDto>> getAllPaymentList() {
        return ResponseEntity.ok(paymentService.getAllPaymentList());
    }
}
