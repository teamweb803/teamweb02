package com.example.ikea.controller;

import com.example.ikea.dto.MemberJoinRequestDto;
import com.example.ikea.dto.MemberLoginRequestDto;
import com.example.ikea.dto.MemberResponseDto;
import com.example.ikea.dto.MemberUpdateDto;
import com.example.ikea.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/member")
public class MemberController {

    private final MemberService memberService;

    //회원가입
    @PostMapping("/join")
    public ResponseEntity<Long> join(@RequestBody @Valid MemberJoinRequestDto request) {
        Long memberId = memberService.join(request);
        return ResponseEntity.ok(memberId);
    }

    //로그인
    @PostMapping("/login")
    public ResponseEntity<MemberResponseDto> login(@RequestBody MemberLoginRequestDto request) {
        MemberResponseDto response = memberService.login(request);
        return ResponseEntity.ok(response);
    }

    //마이페이지
    @GetMapping("/{memberId}")
    public ResponseEntity<MemberResponseDto> detail(@PathVariable Long memberId) {
        return ResponseEntity.ok(memberService.detailMember(memberId));
    }

    //회원 정보 수정
    @PutMapping("/{memberId}")
    public ResponseEntity<MemberResponseDto> update(@PathVariable Long memerId,
                                                    @Valid @RequestBody MemberUpdateDto dto) {
        return ResponseEntity.ok(memberService.update(dto, memerId));
    }

    // 회원탈퇴
    @DeleteMapping("/{memberId}")
    public ResponseEntity<Void> deleteMember(@PathVariable Long memberId) {
        memberService.deleteMember(memberId);
        return ResponseEntity.ok().build();
    }

}
