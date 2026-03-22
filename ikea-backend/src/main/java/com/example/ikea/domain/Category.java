package com.example.ikea.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "category")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    public static final String BED_MATTRESS = "침대/매트리스";

    public static final String SOFA = "소파";

    public static final String DINING = "식탁/테이블/의자";

    public static final String DESK = "책상";

    public static final String KITCHEN_FURNITURE = "주방가구";

    public static final String KITCHEN_SUPPLIES = "주방용품";

    public static final String PLANT = "화분/식물";

}