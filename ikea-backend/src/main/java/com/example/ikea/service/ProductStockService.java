package com.example.ikea.service;

import com.example.ikea.domain.ProductStock;
import com.example.ikea.dto.ProductStockRequestDto;
import com.example.ikea.dto.ProductStockResponseDto;
import com.example.ikea.repository.ProductStockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductStockService {

    private final ProductStockRepository productStockRepository;

    @Transactional(readOnly = true)
    public ProductStockResponseDto getStockByProductId(Long productId) {
        ProductStock stock = productStockRepository.findByProduct_ProductId(productId)
                .orElseThrow(() -> new IllegalArgumentException("해당 상품의 재고 정보가 없습니다."));
        return new ProductStockResponseDto(stock);
    }


    public ProductStockResponseDto updateStock(Long productId, ProductStockRequestDto dto) {
        ProductStock stock = productStockRepository.findByProduct_ProductId(productId)
                .orElseThrow(() -> new IllegalArgumentException("해당 상품의 재고 정보가 없습니다."));

        stock.setQuantity(dto.getQuantity());

        return new ProductStockResponseDto(stock);
    }

}
