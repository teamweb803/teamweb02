package com.example.ikea.repository;


import com.example.ikea.domain.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;


public interface CartProductRepository extends JpaRepository<CartItem, Long> {

    //주문 후 장바구니 비우기
    void deleteByCart_CartId(Long CartId);

}
