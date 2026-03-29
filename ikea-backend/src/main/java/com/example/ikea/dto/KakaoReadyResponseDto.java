package com.example.ikea.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class KakaoReadyResponseDto {
    private String tid;                     //카카오 거래 번호
    private String nextRedirectPcUrl;       //PC 결제창 URL
    private String nextRedirectMobileUrl;   //모바일 결제창 URL
}
