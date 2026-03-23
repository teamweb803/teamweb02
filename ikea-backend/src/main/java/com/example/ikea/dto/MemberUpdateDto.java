package com.example.ikea.dto;

import com.example.ikea.domain.Member;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class MemberUpdateDto {

    @NotBlank(message = "이름 필수 입력")
    private String name;

    @NotBlank(message = "비밀번호 필수 입력")
    @Size(min = 4, max = 20, message = "비밀번호는 4~20자 이내로 입력해주세요")
    private String password;

    @NotBlank(message = "비밀번호 확인 필수 입력")
    private String confirmPassword;

    @NotBlank(message = "이메일 필수 입력")
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    private String email;

    @NotBlank(message = "전화번호 필수 입력")
    @Pattern(regexp = "^01[016789]-?\\d{3,4}-?\\d{4}",
            message = "전화번호 형식이 올바르지 않습니다.")
    private String phoneNumber;

    @NotBlank(message = "주소 필수 입력")
    private String address;

    public boolean isPasswordMatch() {
        return password.equals(confirmPassword);
    }
}
