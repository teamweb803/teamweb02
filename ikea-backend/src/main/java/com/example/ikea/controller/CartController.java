package com.example.ikea.controller;

import com.example.ikea.domain.CartItem;
import com.example.ikea.dto.CartItemResponseDto;
import com.example.ikea.dto.CartRequestDto;
import com.example.ikea.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    //장바구니 조회
    @GetMapping("/{memberId}")
    public ResponseEntity<List<CartItemResponseDto>> getCartList(
            @PathVariable Long memberId) {
        return ResponseEntity.ok(cartService.getCartList(memberId));
    }

    //장바구니 담기
    @PostMapping("/{memberId}")
    public ResponseEntity<Void> addCart(@PathVariable Long memberId,
                                        @RequestBody @Valid CartRequestDto dto) {
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
    @DeleteMapping("/{memberId}/clear")
    public ResponseEntity<Void> clearCart(@PathVariable Long memberId) {
        cartService.clearCart(memberId);
        return ResponseEntity.ok().build();
    }

}
