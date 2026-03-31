package com.example.ikea.controller;

import com.example.ikea.dto.ProductStockRequestDto;
import com.example.ikea.dto.ProductStockResponseDto;
import com.example.ikea.service.ProductStockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/product_stocks")
public class AdminProductStockController {

    private final ProductStockService productStockService;

    @GetMapping("/{productId}")
    public ResponseEntity<ProductStockResponseDto> getStock(@PathVariable Long productId) {
        return ResponseEntity.ok(productStockService.getStockByProductId(productId));
    }

    @PutMapping("/{productId}")
    public ResponseEntity<ProductStockResponseDto> updateStock(
            @PathVariable Long productId,
            @RequestBody @Valid ProductStockRequestDto dto) {
        return ResponseEntity.ok(productStockService.updateStock(productId, dto));
    }
}
