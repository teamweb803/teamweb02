package com.example.ikea.dto;

import com.example.ikea.domain.Member;
import com.example.ikea.domain.MemberRole;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
@RequiredArgsConstructor
public class MemberResponseDto {

    private Long memberId;

    private String loginId;

    private String password;

    private String name;

    private String email;

    private String phoneNumber;

    private String address;

    private LocalDateTime createdAt;

    private MemberRole memberRole;


    public MemberResponseDto(Member member) {
        this.memberId = member.getMemberId();
        this.loginId = member.getLoginId();
        this.password = member.getPassword();
        this.name = member.getName();
        this.email = member.getEmail();
        this.phoneNumber = member.getPhoneNumber();
        this.address = member.getAddress();
        this.createdAt = member.getCreatedAt();
        this.memberRole = member.getMemberRole();
    }
}
