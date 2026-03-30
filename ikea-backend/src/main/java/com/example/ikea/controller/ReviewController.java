package com.example.ikea.controller;

import com.example.ikea.dto.ReviewRequestDto;
import com.example.ikea.dto.ReviewResponseDto;
import com.example.ikea.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/review")
public class ReviewController {

    private final ReviewService reviewService;

    //상품별 리뷰 목록 조회
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewResponseDto>> getReviewList(
            @PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getReviewList(productId));
    }

    // 내 리뷰 목록
    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<ReviewResponseDto>> getMyReviewList(
            @PathVariable Long memberId) {
        return ResponseEntity.ok(reviewService.getMyReviewList(memberId));
    }
    
    //상품 리뷰 생성
    @PostMapping("/{memberId}")
    public ResponseEntity<Long> createReview(@PathVariable Long memberId,
                                             @RequestBody @Valid ReviewRequestDto dto) {
        return ResponseEntity.ok(reviewService.createReview(memberId, dto));
    }
    
    //리뷰 수정
    @PutMapping("/{reviewId}")
    public ResponseEntity<Void> updateReview(@PathVariable Long reviewId,
                                             @RequestBody @Valid ReviewRequestDto dto) {
        reviewService.updateReview(reviewId, dto);
        return ResponseEntity.ok().build();
    }
    
    //리뷰 삭제
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long reviewId) {
        reviewService.deleteReview(reviewId);
        return ResponseEntity.ok().build();
    }

}
