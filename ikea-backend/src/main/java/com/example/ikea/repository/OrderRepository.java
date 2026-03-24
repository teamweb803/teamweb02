package com.example.ikea.repository;

import com.example.ikea.domain.Order;
import com.example.ikea.domain.OrderStatus;
import org.aspectj.weaver.ast.Or;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    //주문내역 조회
    List<Order> findByMember_MemberId(Long memberId);

    //상태별 주문 목록 (관리자 판매 관리)
    List<Order> findByOrderStatus(OrderStatus status);
}
