package com.example.ikea.service;


import com.example.ikea.domain.Category;
import com.example.ikea.domain.Product;
import com.example.ikea.dto.ProductRequestDto;
import com.example.ikea.dto.ProductResponseDto;
import com.example.ikea.repository.CategoryRepository;
import com.example.ikea.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    public final ProductRepository productRepository;
    public final CategoryRepository categoryRepository;

    //상품 목록 조회
    public List<ProductResponseDto> getProductList() {
        return productRepository.findAll()
                .stream()
                .map(ProductResponseDto::new)
                .collect(Collectors.toList());
    }

    //카테고리별 상품 목록
    public List<ProductResponseDto> getProductListByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId)
                .stream()
                .map(ProductResponseDto::new)
                .collect(Collectors.toList());
    }

    //상품 상세 조회
    public ProductResponseDto getDetailProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalStateException("존재하지 않는 상품입니다."));
        return new ProductResponseDto(product);
    }

    //상품 검색
    public List<ProductResponseDto> searchProduct(String keyword) {
        return productRepository.findByNameContaining(keyword)
                .stream()
                .map(ProductResponseDto::new)
                .collect(Collectors.toList());
    }


    // ===================관리자 권한 ====================

    //상품 등록
    @Transactional
    public Long createProduct(ProductRequestDto dto, MultipartFile imgFile) throws IOException {
        String imgPath = saveImage(imgFile);

        Category category = categoryRepository.findById(dto.getCategory().getId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 카테고리입니다."));

        Product product = Product.builder()
                .name(dto.getName())
                .price(dto.getPrice())
                .imgPath(imgPath)
                .category(category)
                .build();

        return productRepository.save(product).getProductId();
    }

    //상품 수정
    @Transactional
    public ProductResponseDto updateProduct(Long productId, ProductRequestDto dto,
                                            MultipartFile imgFile) throws IOException {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalStateException("존재하지 않는 상품입니다."));
        Category category = categoryRepository.findById(dto.getCategory().getId())
                .orElseThrow(() -> new IllegalStateException("존재하지 않는 카테고리입니다."));

        if (imgFile != null && !imgFile.isEmpty()) {
            deleteImage(product.getImgPath());
            product.setImgPath(saveImage(imgFile));
        }

        product.setName(dto.getName());
        product.setPrice(dto.getPrice());
        product.setCategory(dto.getCategory());
        return new ProductResponseDto(product);
    }

    //상품 삭제
    @Transactional
    public void deleteProduct(Long productId) {
        productRepository.deleteById(productId);
    }

    //대시보드용 상품 수
    public Long getProductCount() {
        return productRepository.count();
    }

    // ====================이미지 처리 ===================

    //  이미지 저장
    private String saveImage(MultipartFile imgFile) throws IOException {
        String uploadDir = "src/main/resources/static/uploads/products/";
        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();

        String fileName = UUID.randomUUID() + "_" + imgFile.getOriginalFilename();

        imgFile.transferTo(new File(uploadDir + fileName));

        // Vue에서 접근할 URL 경로 반환
        return "/uploads/products/" + fileName;
    }

    //이미지 삭제
    private void deleteImage(String imgPath) {
        if (imgPath != null) {
            String filePath = "src/main/resources/static" + imgPath;
            File file = new File(filePath);
            if (file.exists()) file.delete();
        }
    }

}
