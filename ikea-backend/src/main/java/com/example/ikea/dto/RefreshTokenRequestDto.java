package com.example.ikea.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RefreshTokenRequestDto {

    private String refreshToken;
}
