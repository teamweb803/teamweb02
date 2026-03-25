package com.example.ikea.service;

import com.example.ikea.domain.*;
import com.example.ikea.dto.ReviewRequestDto;
import com.example.ikea.dto.ReviewResponseDto;
import com.example.ikea.repository.MemberRepository;
import com.example.ikea.repository.OrderRepository;
import com.example.ikea.repository.ProductRepository;
import com.example.ikea.repository.ReviewRepository;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Getter
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final MemberRepository memberRepository;

    // 상품별 리뷰 목록
    public List<ReviewResponseDto> getReviewList(Long productId) {
        return reviewRepository.findByProduct_ProductId(productId)
                .stream()
                .map(ReviewResponseDto::new)
                .collect(Collectors.toList());
    }

    // 내 리뷰 목록
    public List<ReviewResponseDto> getMyReviewList(Long memberId) {
        return reviewRepository.findByMember_MemberId(memberId)
                .stream()
                .map(ReviewResponseDto::new)
                .collect(Collectors.toList());
    }

    // 구매한 상품 리뷰 생성
    @Transactional
    public Long createReview(Long memberId, ReviewRequestDto dto) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 상품입니다."));

        Order order = orderRepository.findById(dto.getOrderId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 주문입니다."));

        //구매 완료된 주문인지 확인
        if (order.getOrderStatus() != OrderStatus.COMPLETED) {
            throw new IllegalArgumentException("구매 완료된 상품이 아닙니다.");
        }

        // 리뷰 중복 확인(상품당 한개만 가능)
        if (reviewRepository.existsByOrder_OrderIdAndProduct_Productid(
                dto.getOrderId(), dto.getProductId())) {
            throw new IllegalArgumentException("이미 리뷰를 작성한 상품입니다.");
        }

        Review review = Review.builder()
                .member(member)
                .order(order)
                .product(product)
                .content(dto.getContent())
                .rating(dto.getRating())
                .build();

        return reviewRepository.save(review).getReviewId();
    }

    // 리뷰 수정
    @Transactional
    public void updateReview(Long reviewId, ReviewRequestDto dto) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰가 존재하지 않습니다."));
        review.setContent(dto.getContent());
        review.setRating(dto.getRating());
    }

    // 리뷰 삭제 (회원 + 관리자 공통)
    @Transactional
    public void deleteReview(Long reviewId) {
        reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰가 존재하지 않습니다."));
        reviewRepository.deleteById(reviewId);

    }

    // ============= 관리자 ==============

    // 리뷰 목록 조회
    public List<ReviewResponseDto> getAllReviewList() {
        return reviewRepository.findAll()
                .stream()
                .map(ReviewResponseDto::new)
                .collect(Collectors.toList());
    }
    
    //관리자 리뷰 삭제는 회원 메서드 그대로 사용
}
