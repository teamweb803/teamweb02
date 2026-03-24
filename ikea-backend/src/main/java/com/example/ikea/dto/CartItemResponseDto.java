package com.example.ikea.dto;

import com.example.ikea.domain.CartItem;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CartItemResponseDto {

    private Long cartItemId;

    private Long productId;

    private String productName;

    private Integer price;

    private String imgPath;

    private Integer quantity;

    private Integer totalPrice; // 단가 * 수량

    public CartItemResponseDto(CartItem cartItem) {
        this.cartItemId = cartItem.getCartItemId();
        this.productName = cartItem.getProduct().getName();
        this.productId = cartItem.getProduct().getProductId();
        this.price = cartItem.getProduct().getPrice();
        this.imgPath = cartItem.getProduct().getImgPath();
        this.quantity = cartItem.getQuantity();
        this.totalPrice = cartItem.getProduct().getPrice() * cartItem.getQuantity();
    }
}
