package com.example.ikea.repository;

import com.example.ikea.domain.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    //특정 카테고리 조회
    Optional<Category> findByName(String name);
}
