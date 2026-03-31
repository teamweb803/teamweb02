package com.example.ikea.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    //결제 수단
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod paymentMethod;

    //결제 수단 번호(카드번호 등)
    @Column(length = 100)
    private String methodNo;

    //PG사에서 발급한 고유 거래 번호
    @Column(length = 100)
    private String transactionId;

    //결제 금액
    @Column(nullable = false)
    private Integer amount;

    //결제 상태
    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    //PG사 응답 데이터 원본
    @Column(columnDefinition = "TEXT")
    private String responseData;

    //취소 사유
    @Column(length = 255)
    private String cancelReason;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    //결제 완료 시간
    private LocalDateTime paidAt;

    //취소 시간
    private LocalDateTime cancelledAt;
}
