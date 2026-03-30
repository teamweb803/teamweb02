package com.example.ikea.repository;


import com.example.ikea.domain.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    // 장바구니에 담긴 상품 목록 조회
    List<CartItem> findByCart_CartId(Long cartId);

    // 장바구니에 특정 상품 존재 확인 (중복 체크)
    Optional<CartItem> findByCart_CartIdAndProduct_ProductId(Long cartId, Long productId);

    //주문 후 장바구니 비우기
    void deleteByCart_CartId(Long CartId);
}
