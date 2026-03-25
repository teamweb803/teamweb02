package com.example.ikea.controller;

import com.example.ikea.dto.ReviewResponseDto;
import com.example.ikea.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/review")
public class AdminReviewController {

    private final ReviewService reviewService;

    // 전체 리뷰 조회
    @GetMapping
    public ResponseEntity<List<ReviewResponseDto>> getAllReviewList() {
        return ResponseEntity.ok(reviewService.getAllReviewList());
    }

    // 리뷰 삭제
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long reviewId) {
        reviewService.deleteReview(reviewId);
        return ResponseEntity.ok().build();
    }
}
