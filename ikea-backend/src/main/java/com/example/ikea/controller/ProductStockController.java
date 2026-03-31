package com.example.ikea.controller;

import com.example.ikea.dto.ProductStockResponseDto;
import com.example.ikea.service.ProductStockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/product_stocks")
public class ProductStockController {

    private final ProductStockService productStockService;

    @GetMapping("/{productId}")
    public ResponseEntity<ProductStockResponseDto> getStock(@PathVariable Long productId) {
        return ResponseEntity.ok(productStockService.getStockByProductId(productId));
    }
}
