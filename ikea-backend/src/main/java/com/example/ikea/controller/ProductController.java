package com.example.ikea.controller;

import com.example.ikea.dto.ProductResponseDto;
import com.example.ikea.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/product")
public class ProductController {

    private final ProductService productService;

    //상품 목록
    @GetMapping
    public ResponseEntity<List<ProductResponseDto>> getProductList() {
        return ResponseEntity.ok(productService.getProductList());
    }

    //카테고리별 목록
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<ProductResponseDto>> getProductListByCategory(
            @PathVariable Long categoryId) {
        return ResponseEntity.ok(productService.getProductListByCategory(categoryId));
    }

    //상품 검색
    @GetMapping("/search")
    public ResponseEntity<List<ProductResponseDto>> searchProduct(@RequestParam String keyword) {
        return ResponseEntity.ok(productService.searchProduct(keyword));
    }


    //상품 상세 조회
    @GetMapping("/{productId}")
    public ResponseEntity<ProductResponseDto> getDetailProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(productService.getDetailProduct(productId));
    }

}
