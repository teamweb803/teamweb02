package com.example.ikea.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class KakaoConfirmRequestDto {

    @NotBlank(message = "pgToken을 입력해주세요.")
    private String pgToken;

    @NotBlank(message = "tid를 입력해주세요.")
    private String tid;

    @NotNull(message = "주문Id를 입력해주세요.")
    private Long orderId;
}
