package com.example.ikea.repository;


import com.example.ikea.domain.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    //카테고리별 상품 조회
    List<Product> findByCategoryId(Long categoryId);

    //상품 검색
    List<Product> findByNameContaining(String keyword);
}
