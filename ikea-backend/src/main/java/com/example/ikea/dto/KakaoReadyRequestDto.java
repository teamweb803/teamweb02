package com.example.ikea.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class KakaoReadyRequestDto {

    @NotNull(message = "주문Id를 입력해주세요")
    private Long orderId;
}
