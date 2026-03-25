package com.example.ikea.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CartRequestDto {

    @NotNull(message = "상품은 필수 입력입니다.")
    private Long productId;

    @NotNull(message = "수량은 필수 입력입니다.")
    private Integer quantity;
}
