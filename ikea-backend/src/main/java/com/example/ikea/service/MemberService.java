package com.example.ikea.service;

import com.example.ikea.config.PasswordConfig;
import com.example.ikea.domain.Cart;
import com.example.ikea.domain.Member;
import com.example.ikea.domain.MemberRole;
import com.example.ikea.dto.MemberJoinRequestDto;
import com.example.ikea.dto.MemberLoginRequestDto;
import com.example.ikea.dto.MemberResponseDto;
import com.example.ikea.dto.MemberUpdateDto;
import com.example.ikea.repository.CartRepository;
import com.example.ikea.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final CartRepository cartRepository;

    //로그인
    public MemberResponseDto login(MemberLoginRequestDto request) {
        Member member = memberRepository.findByLoginId(request.getLoginId())
                .orElseThrow(() -> new IllegalArgumentException("아이디 또는 비밀번호가 일치하지 않습니다."));
        if (!passwordEncoder.matches(request.getPassword(), member.getPassword())) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 일치하지 않습니다.");
        }
        return new MemberResponseDto(member);
    }

    //회원가입
    @Transactional
    public Long join(MemberJoinRequestDto request) {
        if (memberRepository.existByLoginId(request.getLoginId())) {
            throw new IllegalArgumentException("이미 사용 중인 아이디 입니다.");
        }
        if (!request.isPasswordMatch()) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        Member member = request.toEntity();
        member.setPassword(passwordEncoder.encode(request.getPassword()));
        memberRepository.save(member);

        Cart cart = Cart.builder().member(member).build();
        cartRepository.save(cart);

        return member.getMemberId();
    }

    // 내 정보 조회 (/api/member/me 용)
    public MemberResponseDto getMember(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));
        return new MemberResponseDto(member);
    }

    //마이페이지
    public MemberResponseDto detailMember(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));
        return new MemberResponseDto(member);
    }


    //회원 정보 수정
    @Transactional
    public MemberResponseDto update(MemberUpdateDto dto, Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        member.setName(dto.getName());
        member.setEmail(dto.getEmail());
        member.setPhoneNumber(dto.getPhoneNumber());
        member.setZoneCode(dto.getZoneCode());
        member.setAddressMain(dto.getAddressMain());
        member.setAddressDetail(dto.getAddressDetail());

        return new MemberResponseDto(member);
    }

    //회원 탈퇴
    @Transactional
    public void deleteMember(Long memberId) {
        memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));
        memberRepository.deleteById(memberId);
    }


    // ================= 관리자 권한 =====================
    //회원 목록
    public List<MemberResponseDto> getMemberList() {
        return memberRepository.findAll()
                .stream()
                .map(MemberResponseDto::new)
                .collect(Collectors.toList());
    }

    //회원 검색
    public List<MemberResponseDto> searchMember(String keyword) {
        return memberRepository.findByMemberNameContaining(keyword)
                .stream()
                .map(MemberResponseDto::new)
                .collect(Collectors.toList());
    }

    //회원 강퇴
    public void kickMember(Long memberId) {
        memberRepository.deleteById(memberId);
    }

    //회원 등급 변경
    @Transactional
    public void changeRole(Long memberId, MemberRole memberRole) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));
        member.setMemberRole(memberRole);
    }

    //대시보드용 회원 수
    public Long getMemberCount() {
        return memberRepository.count();
    }
}
