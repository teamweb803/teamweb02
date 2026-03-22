package com.example.ikea.repository;

import com.example.ikea.domain.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CartRepository extends JpaRepository<Cart, Long> {

    //회원 장바구니 조회
    List<Cart> findByMemberCart(Long memberId);

}
