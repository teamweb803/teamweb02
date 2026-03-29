package com.example.ikea.controller;

import com.example.ikea.dto.*;
import com.example.ikea.security.JwtTokenProvider;
import com.example.ikea.service.MemberService;
import com.example.ikea.service.RefreshTokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/member")
public class MemberController {

    private final MemberService memberService;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;

    //회원가입
    @PostMapping("/join")
    public ResponseEntity<Long> join(@RequestBody @Valid MemberJoinRequestDto request) {
        Long memberId = memberService.join(request);
        return ResponseEntity.ok(memberId);
    }

    //로그인
    @PostMapping("/login")
    public ResponseEntity<TokenResponseDto> login(@RequestBody MemberLoginRequestDto request) {
        MemberResponseDto member = memberService.login(request);

        String accessToken = jwtTokenProvider.createAccessToken(
                member.getLoginId(), member.getMemberRole().name());
        String refreshToken = jwtTokenProvider.createRefreshToken(member.getLoginId());

        refreshTokenService.saveRefreshToken(
                member.getLoginId(),
                refreshToken,
                member.getMemberRole().name());

        return ResponseEntity.ok(new TokenResponseDto(accessToken, refreshToken));
    }

    //마이페이지
    @GetMapping("/{memberId}")
    public ResponseEntity<MemberResponseDto> detail(@PathVariable Long memberId) {
        return ResponseEntity.ok(memberService.getMember(memberId));
    }

    //회원 정보 수정
    @PutMapping("/{memberId}")
    public ResponseEntity<MemberResponseDto> update(@PathVariable Long memberId,
                                                    @Valid @RequestBody MemberUpdateDto dto) {
        return ResponseEntity.ok(memberService.update(dto, memberId));
    }

    // 회원탈퇴
    @DeleteMapping("/{memberId}")
    public ResponseEntity<Void> deleteMember(@PathVariable Long memberId) {
        memberService.deleteMember(memberId);
        return ResponseEntity.ok().build();
    }


    // 내 정보 조회 (로그인한 회원 본인)
    @GetMapping("/me")
    public ResponseEntity<MemberResponseDto> getMe(@RequestParam Long memberId) {
        return ResponseEntity.ok(memberService.getMember(memberId));
    }
}
