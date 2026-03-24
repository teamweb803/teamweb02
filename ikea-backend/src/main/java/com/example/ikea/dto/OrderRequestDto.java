package com.example.ikea.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class OrderRequestDto {

    @NotBlank(message = "결제 수단을 선택해주세요")
    private String payment;

    @NotBlank(message = "주소는 필수 입력")
    private String address;

}
