package com.example.ikea.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ReviewRequestDto {

    @NotNull(message = "주문 정보가 없습니다.")
    private Long orderId;

    @NotNull(message = "상품 정보가 없습니다.")
    private Long productId;

    @NotBlank(message = "리뷰 내용을 작성해주세요.")
    private String content;

    @NotNull(message = "평점을 입력해주세요.")
    @Min(value = 1, message = "평점은 1점 이상이어야 합니다.")
    @Max(value = 5, message = "평점은 5점 이하여야 합니다.")
    private Integer rating;
}
