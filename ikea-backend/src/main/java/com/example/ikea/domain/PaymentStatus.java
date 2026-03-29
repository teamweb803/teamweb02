package com.example.ikea.domain;

public enum PaymentStatus {
    PENDING,    //결제 대기
    OK,     //결제 완료
    CANCEL, //취소
    FAILED  //실패
}
