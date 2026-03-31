package com.example.ikea.repository;

import com.example.ikea.domain.ProductStock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductStockRepository extends JpaRepository<ProductStock, Long> {

    Optional<ProductStock> findByProduct_ProductId(Long productId);

    //재고 먼저 삭제 후 상품 삭제
    void deleteByProduct_ProductId(Long productId);
}
