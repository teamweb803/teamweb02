package com.example.ikea.dto;

import com.example.ikea.domain.Category;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;


@Getter
@AllArgsConstructor
public class ProductRequestDto {
    
    @NotBlank(message = "상품명을 입력해주세요.")
    private String name;
    
    @NotNull(message = "가격을 입력해주세요.")
    private Integer price;
    
    @NotNull(message = "카테고리를 입력해주세요.")
    private Long categoryId;


}
