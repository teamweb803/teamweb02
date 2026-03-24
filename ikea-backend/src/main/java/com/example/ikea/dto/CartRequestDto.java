package com.example.ikea.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CartRequestDto {

    @NotBlank(message = "상품은 필수 입력입니다.")
    private Long productId;

    @NotBlank(message = "수량은 필수 입력입니다.")
    private Integer quantity;
}
