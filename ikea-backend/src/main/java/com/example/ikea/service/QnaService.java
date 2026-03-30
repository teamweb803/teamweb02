package com.example.ikea.service;

import com.example.ikea.domain.Qna;
import com.example.ikea.dto.QnaRequestDto;
import com.example.ikea.dto.QnaResponseDto;
import com.example.ikea.repository.QnaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QnaService {

    private final QnaRepository qnaRepository;

    // 전체 목록
    public List<QnaResponseDto> getQnaList() {
        return qnaRepository.findAllGrouped().stream()
                .map(QnaResponseDto::new)
                .collect(Collectors.toList());
    }

    // 제목 검색
    public List<QnaResponseDto> searchQna(String title) {
        return qnaRepository.findByTitle(title).stream()
                .map(QnaResponseDto::new)
                .collect(Collectors.toList());
    }

    // 특정 질문의 답변 목록
    public List<QnaResponseDto> getAnswerList(Long parentId) {
        return qnaRepository.findByParentIdOrderByLevelAscCreatedAtAsc(parentId).stream()
                .map(QnaResponseDto::new)
                .collect(Collectors.toList());
    }

    // 질문 상세 조회
    public QnaResponseDto getQna(Long qnaId) {
        Qna question = qnaRepository.findById(qnaId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게시글입니다."));
        return new QnaResponseDto(question);
    }

    // 질문 등록 (일반회원)
    @Transactional
    public Long createQna(QnaRequestDto dto) {
        Qna question = Qna.builder()
                .title(dto.getTitle())
                .content(dto.getContent())
                .writer(dto.getWriter())
                .level(0)
                .parentId(0L)
                .build();

        qnaRepository.save(question);
        question.setParentId(question.getQnaId());
        return question.getQnaId();
    }

    // 질문 수정 (일반회원)
    @Transactional
    public void updateQna(Long qnaId, QnaRequestDto dto) {
        Qna question = qnaRepository.findById(qnaId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게시글입니다."));
        if (question.getLevel() != 0) {
            throw new IllegalArgumentException("질문만 수정할 수 있습니다.");
        }
        question.setTitle(dto.getTitle());
        question.setContent(dto.getContent());
    }

    // 질문 삭제 (일반회원)
    @Transactional
    public void deleteQuestion(Long qnaId) {
        Qna question = qnaRepository.findById(qnaId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게시글입니다."));
        if (question.getLevel() != 0) {
            throw new IllegalArgumentException("질문만 삭제할 수 있습니다.");
        }
        qnaRepository.deleteByParentId(question.getQnaId());
        qnaRepository.delete(question);
    }

    // ===================== 관리자 =====================

    // 답변 등록 (관리자)
    @Transactional
    public Long createAnswer(Long parentId, QnaRequestDto dto) {
        qnaRepository.findById(parentId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 질문입니다."));

        Qna answer = Qna.builder()
                .title(dto.getTitle())
                .content(dto.getContent())
                .writer(dto.getWriter())
                .level(1)
                .parentId(parentId)
                .build();

        return qnaRepository.save(answer).getQnaId();
    }

    // 답변 수정 (관리자)
    @Transactional
    public void updateAnswer(Long qnaId, QnaRequestDto dto) {
        Qna answer = qnaRepository.findById(qnaId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게시글입니다."));
        if (answer.getLevel() != 1) {
            throw new IllegalArgumentException("답변만 수정할 수 있습니다.");
        }
        answer.setTitle(dto.getTitle());
        answer.setContent(dto.getContent());
    }

    // 답변 삭제 (관리자)
    @Transactional
    public void deleteAnswer(Long qnaId) {
        Qna answer = qnaRepository.findById(qnaId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게시글입니다."));
        if (answer.getLevel() != 1) {
            throw new IllegalArgumentException("답변만 삭제할 수 있습니다.");
        }
        qnaRepository.delete(answer);
    }
}