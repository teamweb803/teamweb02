package com.example.ikea.service;

import com.example.ikea.domain.Qna;
import com.example.ikea.dto.QnaRequestDto;
import com.example.ikea.repository.QnaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QnaService {

    private final QnaRepository qnaRepository;

    //qna 목록
    public List<Qna> getQnaList() {
        return qnaRepository.findAllGrouped();  //질문-답변을 그룹으로 묶음
    }

    //제목 검색
    public List<Qna> searchByTitle(String keyword) {
        return qnaRepository.findByTitle(keyword);
    }

    //특정 질문의 답변 목록
    public List<Qna> getAnswerList(Long parentId) {
        return qnaRepository.findByParentIdOrderByLevelAscCreatedAtAsc(parentId);
    }

    //질문 상세 조회
    public Qna getQna(Long qnaId) {
        return qnaRepository.findById(qnaId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게시글입니다."));
    }

    //질문 등록 (일반 회원)
    @Transactional
    public Long createQuestion(QnaRequestDto dto) {
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

    //질문 수정 (일반 회원)
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

    //질문 삭제 (일반 회원)
    @Transactional
    public void deleteQuestion(Long qnaId) {
        Qna question = qnaRepository.findById(qnaId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게시글입니다."));
        if (question.getLevel() != 0) {
            throw new IllegalArgumentException("질문만 삭제할 수 있습니다.");
        }
        //질문 삭제 시 답변도 같이 삭제
        qnaRepository.deleteByParentId(question.getQnaId());
        qnaRepository.delete(question);
    }


    // =============관리자 =================

    //답변 등록 (관리자)
    @Transactional
    public Long createAnswer(Long parentId, QnaRequestDto dto) {
        //부모 질문 존재 여부 확인
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

    //답변 수정 (관리자)
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

    //답변 삭제 (관리자)
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
