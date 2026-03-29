package com.example.ikea.repository;


import com.example.ikea.domain.Category;
import com.example.ikea.domain.Product;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    //카테고리별 상품 조회
    List<Product> findByCategoryId(Long categoryId);

    //상품 검색
    List<Product> findByNameContaining(String keyword);

    //신상품 - 최근 등록순 4건
    List<Product> findTop4ByOrderByCreatedAtDesc();
    
    //베스트 - 많이 팔린 순 4건
    @Query("SELECT p FROM Product p " +
            "JOIN OrderItem oi ON oi.product = p " +
            "GROUP BY p " +
            "ORDER BY SUM(oi.quantity) DESC")

    List<Product> findTop4ByBestProducts(Pageable pageable);
    
    //추천 - 카테고리별 최신 3건
    List<Product> findTop3ByCategoryOrderByCreatedAtDesc(Category category);
}
