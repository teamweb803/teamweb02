package com.example.ikea.controller;

import com.example.ikea.domain.Category;
import com.example.ikea.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/category")
public class CategoryController {

    private final CategoryService categoryService;

    //전체 카테고리 목록 (네비게이션 메뉴 용)
    @GetMapping
    public ResponseEntity<List<Category>> getCategoryList() {
        return ResponseEntity.ok(categoryService.getCategoryList());
    }


    //카테고리로 조회
    @GetMapping("/search")
    public ResponseEntity<Category> getCategory(@RequestParam String name) {
        return ResponseEntity.ok(categoryService.getCategoryByName(name));
    }

}
