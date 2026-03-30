package com.example.ikea.controller;

import com.example.ikea.domain.CartItem;
import com.example.ikea.dto.CartItemResponseDto;
import com.example.ikea.dto.CartRequestDto;
import com.example.ikea.service.CartService;
import com.example.ikea.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;
    private final MemberService memberService;

    //장바구니 조회
    @GetMapping
    public ResponseEntity<List<CartItemResponseDto>> getCartList(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long memberId = memberService.getMemberIdByLoginId(userDetails.getUsername());
        return ResponseEntity.ok(cartService.getCartList(memberId));
    }

    //장바구니 담기
    @PostMapping
    public ResponseEntity<Void> addCart(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @Valid CartRequestDto dto) {
        Long memberId = memberService.getMemberIdByLoginId(userDetails.getUsername());
        cartService.addCart(memberId, dto);
        return ResponseEntity.ok().build();
    }

    //수량 수정
    @PatchMapping("/{cartItemId}/quantity")
    public ResponseEntity<Void> updateQuantity(@PathVariable Long cartItemId,
                                               @RequestParam int quantity) {
        cartService.updateQuantity(cartItemId, quantity);
        return ResponseEntity.ok().build();
    }

    //단건 삭제
    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<Void> deleteCartItem(@PathVariable Long cartItemId) {
        cartService.deleteCartItem(cartItemId);
        return ResponseEntity.ok().build();
    }

    //전체 비우기
    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long memberId = memberService.getMemberIdByLoginId(userDetails.getUsername());
        cartService.clearCart(memberId);
        return ResponseEntity.ok().build();
    }

}
