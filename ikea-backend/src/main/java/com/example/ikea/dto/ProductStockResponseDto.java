package com.example.ikea.dto;

import com.example.ikea.domain.ProductStock;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ProductStockResponseDto {

    private Long stockId;

    private Long productId;

    private Integer quantity;

    private LocalDateTime updatedAt;

    public ProductStockResponseDto(ProductStock stock) {
        this.stockId = stock.getStockId();
        this.productId = stock.getProduct().getProductId();
        this.quantity = stock.getQuantity();
        this.updatedAt = stock.getUpdatedAt();
    }
}
