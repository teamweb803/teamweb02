package com.example.ikea.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "product_stocks")
public class ProductStock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long stockId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
