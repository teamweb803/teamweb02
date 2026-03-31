package com.example.ikea.service;

import com.example.ikea.domain.Category;
import com.example.ikea.repository.CategoryRepository;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Getter
@AllArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    // 전체 카테고리 목록 (네비게이션 메뉴용)
    public List<Category> getCategoryList() {
        return categoryRepository.findAll();
    }

    // 카테고리로 조회
    public Category getCategoryByName(String name) {
        return categoryRepository.findByName(name)
                .orElseThrow(() -> new IllegalArgumentException("카테고리가 존재하지 않습니다."));
    }
}
