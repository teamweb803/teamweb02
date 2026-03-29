package com.example.ikea.controller;

import com.example.ikea.dto.MemberLoginRequestDto;
import com.example.ikea.dto.MemberResponseDto;
import com.example.ikea.dto.RefreshTokenRequestDto;
import com.example.ikea.dto.TokenResponseDto;
import com.example.ikea.security.JwtTokenProvider;
import com.example.ikea.service.MemberService;
import com.example.ikea.service.RefreshTokenService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final MemberService memberService;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;

    
    // Access Token 재발급
    @PostMapping("/refresh")
    public ResponseEntity<TokenResponseDto> refresh(@RequestBody RefreshTokenRequestDto request) {
        String refreshToken = request.getRefreshToken();

        // Refresh Token 검증
        if(!jwtTokenProvider.validateToken(refreshToken)) {
            return ResponseEntity.status(HttpServletResponse.SC_UNAUTHORIZED).build();
        }

        String loginId = jwtTokenProvider.getLoginId(refreshToken);

        // DB에 저장된 Refresh Token과 비교
        refreshTokenService.validateRefreshToken(loginId, refreshToken);

        // 새 Access Token 발급
        String newAccessToken = jwtTokenProvider.createAccessToken(
                loginId, refreshTokenService.getMemberRole(loginId));

        return ResponseEntity.ok(new TokenResponseDto(newAccessToken, refreshToken));
    }

    // 로그아웃
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody RefreshTokenRequestDto request) {
        String loginId = jwtTokenProvider.getLoginId(request.getRefreshToken());
        refreshTokenService.deleteRefreshToken(loginId);
        return ResponseEntity.ok().build();
    }
}
