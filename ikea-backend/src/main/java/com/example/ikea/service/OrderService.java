package com.example.ikea.service;

import com.example.ikea.repository.OrderRepository;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.stereotype.Service;

@Getter
@Service
@AllArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;

    //주문 목록 조회(내 주문 내역)

    //주문 상세 조회

    //주문 생성 (장바구니 -> 주문)

    //총 금액 계산

    //주문 생성

    //장바구니 상품 -> 주문상품으로 전환

    //주문완료 후 장바구니 비우기

    //주문 취소

    // ====================== 관리자 ===================

    //전체 주문 목록

    //상태별 주문 목록 (판매 관리)

    //주문 상태 변경 (배송 관리)

    //대시보드용 주문 수
}
