package com.example.ikea.dto;

import com.example.ikea.domain.Payment;
import com.example.ikea.domain.PaymentMethod;
import com.example.ikea.domain.PaymentStatus;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class PaymentResponseDto {

    private Long paymentId;
    private Long orderId;
    private String orderNo;
    private PaymentMethod paymentMethod;
    private String transactionId;
    private Integer amount;
    private PaymentStatus paymentStatus;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;

    public PaymentResponseDto(Payment payment) {
        this.paymentId = payment.getPaymentId();
        this.orderId = payment.getOrder().getOrderId();
        this.orderNo = payment.getOrder().getOrderNo();
        this.paymentMethod = payment.getPaymentMethod();
        this.transactionId = payment.getTransactionId();
        this.amount = payment.getAmount();
        this.paymentStatus = payment.getPaymentStatus();
        this.createdAt = payment.getCreatedAt();
        this.paidAt = payment.getPaidAt();
    }
}
