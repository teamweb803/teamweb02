package com.example.ikea.dto;

import com.example.ikea.domain.Product;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ProductResponseDto {

    private Long productId;
    private String name;
    private Integer price;
    private String imgPath;
    private String categoryName;
    private LocalDateTime createdAt;

    public ProductResponseDto(Product product) {
        this.productId = product.getProductId();
        this.name = product.getName();
        this.price = product.getPrice();
        this.imgPath = product.getImgPath();
        this.categoryName = product.getCategory().getName();
        this.createdAt = product.getCreatedAt();
    }
}