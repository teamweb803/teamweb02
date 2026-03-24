package com.example.ikea.repository;

import com.example.ikea.domain.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {

    //회원 장바구니 조회 (회원당 1개)
    Optional<Cart> findByMemberCart(Long memberId);

}
