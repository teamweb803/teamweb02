package com.example.ikea.dto;

import com.example.ikea.domain.Member;
import com.example.ikea.domain.MemberRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MemberJoinRequestDto {

    @NotBlank(message = "아이디 필수 입력")
    @Size(min = 4, max = 20, message = "아이디는 2~20자 이내로 입력해주세요.")
    private String loginId;

    @NotBlank(message = "비밀번호 필수 입력")
    @Size(min = 4, max = 20, message = "비밀번호는 4~20자 이내로 입력해주세요")
    private String password;

    @NotBlank(message = "비밀번호 확인 필수 입력")
    private String confirmPassword;

    @NotBlank(message = "이름 필수 입력")
    private String name;

    @NotBlank(message = "이메일 필수 입력")
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    private String email;

    @NotBlank(message = "전화번호 필수 입력")
    @Pattern(regexp = "^01[016789]-?\\d{3,4}-?\\d{4}",
             message = "전화번호 형식이 올바르지 않습니다.")
    private String phoneNumber;

    private String zoneCode;

    private String addressMain;

    private String addressDetail;


    //비밀번호 확인
    public boolean isPasswordMatch() {
        return password != null && password.equals(confirmPassword);
    }

    public Member toEntity() {
        return Member.builder()
                .loginId(this.loginId)
                .password(this.password)
                .name(this.name)
                .email(this.email)
                .phoneNumber(this.phoneNumber)
                .email(this.email)
                .zoneCode(this.zoneCode)
                .addressMain(this.addressMain)
                .addressDetail(this.addressDetail)
                .memberRole(MemberRole.USER)
                .build();
    }
}
