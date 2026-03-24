package com.example.ikea.service;

import com.example.ikea.domain.*;
import com.example.ikea.dto.OrderRequestDto;
import com.example.ikea.dto.OrderResponseDto;
import com.example.ikea.repository.*;
import lombok.AllArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Transactional(readOnly = true)
@Service
@AllArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final MemberRepository memberRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;

    //주문 목록 조회(내 주문 내역)
    public List<OrderResponseDto> getOrderList(Long memberId) {
        return orderRepository.findByMember_MemberId(memberId).stream()
                .map(OrderResponseDto::new)
                .collect(Collectors.toList());
    }

    //주문 상세 조회
    public OrderResponseDto getDetailOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalStateException("존재하지 않는 주문입니다."));
        return new OrderResponseDto(order);
    }

    //주문 생성 (장바구니 -> 주문)
    @Transactional
    public Long createOrder(Long memberId, OrderRequestDto dto) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalStateException("존재하지 않는 회원입니다."));
        Cart cart = cartRepository.findByMemberCart(memberId)
                .orElseThrow(() -> new IllegalStateException("존재하지 않는 장바구니입니다."));
        List<CartItem> cartItems = cartItemRepository.findByCart_CartId(cart.getCartId());
        if (cartItems.isEmpty()) {
            throw new IllegalArgumentException("장바구니가 비어있습니다.");
        }
        //총 금액 계산
        int totalPrice = cartItems.stream()
                .mapToInt(cp -> cp.getProduct().getPrice() * cp.getQuantity())
                .sum();

        //주문 생성
        Order order = Order.builder()
                .member(member)
                .orderStatus(OrderStatus.ORDERED)
                .totalPrice(totalPrice)
                .payment(dto.getPayment())
                .address(dto.getAddress())
                .build();

        //장바구니 상품 -> 주문상품으로 전환
        cartItems.forEach(cp -> {
            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(cp.getProduct())
                    .quantity(cp.getQuantity())
                    .orderPrice(cp.getProduct().getPrice())
                    .build();
            orderItemRepository.save(orderItem);
        });

        //주문완료 후 장바구니 비우기
        cartItemRepository.deleteByCart_CartId(cart.getCartId());

        return order.getOrderId();
    }


    //주문 취소
    @Transactional
    public void cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalStateException("존재하지 않는 주문입니다."));

        //배송중인 주문은 취소 불가
        if (order.getOrderStatus() == OrderStatus.DELIVERING) {
            throw new IllegalArgumentException("이미 배송중인 주문은 취소할 수 없습니다.");
        }
        order.setOrderStatus(OrderStatus.CANCELLED);
    }

    // ====================== 관리자 ===================

    //전체 주문 목록
    public List<OrderResponseDto> getAllOrderList() {
        return orderRepository.findAll().stream()
                .map(OrderResponseDto::new)
                .collect(Collectors.toList());
    }

    //상태별 주문 목록 (판매 관리)
    public List<OrderResponseDto> getOrderListByStatus(OrderStatus status) {
        return orderRepository.findByOrderStatus(status).stream()
                .map(OrderResponseDto::new)
                .collect(Collectors.toList());
    }

    //주문 상태 변경 (배송 관리)
    @Transactional
    public void updateOrderStatus(OrderStatus status, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalStateException("존재하지 않는 주문입니다."));
        order.setOrderStatus(status);
    }

    //대시보드용 주문 수
    public Long getOrderCount() {
        return orderRepository.count();
    }
}
