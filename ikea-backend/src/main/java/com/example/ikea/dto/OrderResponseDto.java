package com.example.ikea.dto;

import com.example.ikea.domain.OrderItem;
import com.example.ikea.domain.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class OrderResponseDto {

    private Long orderId;

    private OrderStatus orderStatus;

    private Integer totalPrice;

    private String payment;

    private String address;

    //===================여기서부터 작업 시작===================
}
