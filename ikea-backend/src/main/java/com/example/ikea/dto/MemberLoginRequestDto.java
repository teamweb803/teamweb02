package com.example.ikea.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class MemberLoginRequestDto {

    @NotBlank(message = "아이디를 입력해주세요")
    @Size(min = 4, max = 20, message = "아이디는 2~20자 이내로 입력해주세요.")
    private String loginId;

    @NotBlank(message = "비밀번호를 입력해주세요")
    @Size(min = 4, max = 20, message = "비밀번호는 4~20자 이내로 입력해주세요")
    private String password;
}
