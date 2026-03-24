package com.example.ikea.service;

import com.example.ikea.domain.Cart;
import com.example.ikea.domain.CartItem;
import com.example.ikea.domain.Product;
import com.example.ikea.dto.CartItemResponseDto;
import com.example.ikea.dto.CartRequestDto;
import com.example.ikea.repository.CartItemRepository;
import com.example.ikea.repository.CartRepository;
import com.example.ikea.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    //장바구니 조회
    public List<CartItemResponseDto> getCartList(Long memberId) {
        Cart cart = cartRepository.findByMemberCart(memberId)
                .orElseThrow(() -> new IllegalArgumentException("장바구니가 존재하지 않습니다."));
        return cart.getCartItemList()
                .stream()
                .map(CartItemResponseDto::new)
                .collect(Collectors.toList());
    }

    //장바구니 담기
    @Transactional
    public void addCart(Long memberId, CartRequestDto dto) {
        Cart cart = cartRepository.findByMemberCart(memberId)
                .orElseThrow(() -> new IllegalArgumentException("장바구니가 존재하지 않습니다."));
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 상품입니다."));

        //이미 담긴 상품이면 수량만 추가
        cartItemRepository.findByCart_CartIdAndProduct_productId(cart.getCartId(), dto.getProductId())
                .ifPresentOrElse(
                        cp -> cp.setQuantity(cp.getQuantity() + dto.getQuantity()),
                        () -> cartItemRepository.save(CartItem.builder()
                                        .cart(cart)
                                        .product(product)
                                        .quantity(dto.getQuantity())
                                .build())
                );
    }

    //장바구니 상품 수량 수정
    @Transactional
    public void updateQuantity(Long cartItemId, int quantity) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 장바구니 입니다."));
        if (quantity < 1) {
            throw new IllegalArgumentException("수량은 최소 1개 이상이어야 합니다.");
        }
        cartItem.setQuantity(quantity);
    }

    //장바구니 상품 단건 삭제
    @Transactional
    public void deleteCartItem(Long cartItemId) {
        cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 장바구니입니다."));
        cartItemRepository.deleteById(cartItemId);
    }

    //장바구니 전체 비우기
    @Transactional
    public void clearCart(Long memberId) {
        Cart cart = cartRepository.findByMemberCart(memberId).
                orElseThrow(() -> new IllegalArgumentException("장바구니가 존재하지 않습니다."));
        cartItemRepository.deleteByCart_CartId(cart.getCartId());
    }
}
