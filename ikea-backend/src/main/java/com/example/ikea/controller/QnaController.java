package com.example.ikea.controller;

import com.example.ikea.domain.Qna;
import com.example.ikea.dto.QnaRequestDto;
import com.example.ikea.service.QnaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/qna")
public class QnaController {

    private final QnaService qnaService;

    //qna 목록
    @GetMapping
    public ResponseEntity<List<Qna>> getQnaList() {
        return ResponseEntity.ok(qnaService.getQnaList());
    }

    //qna 검색
    @GetMapping("/search")
    public ResponseEntity<List<Qna>> searchQna(@RequestParam String title) {
        return ResponseEntity.ok(qnaService.searchByTitle(title));
    }

    //질문 상세보기 + 답변 보기
    @GetMapping("/{qnaId}")
    public ResponseEntity<Map<String, Object>> getQna(@PathVariable Long qnaId) {
        Qna question = qnaService.getQna(qnaId);
        List<Qna> answers = qnaService.getAnswerList(question.getParentId());

        Map<String, Object> response = new HashMap<>();
        response.put("question", question);
        response.put("answers", answers);

        return ResponseEntity.ok(response);
    }

    //질문 등록
    @PostMapping
    public ResponseEntity<Long> createQuestion(@RequestBody @Valid QnaRequestDto dto) {
        return ResponseEntity.ok(qnaService.createQuestion(dto));
    }

    //질문 수정
    @PutMapping("/{qnaId}")
    public ResponseEntity<Void> updateQuestion(@PathVariable Long qnaId,
                                               @RequestBody @Valid QnaRequestDto dto) {
        qnaService.updateQna(qnaId, dto);
        return ResponseEntity.ok().build();
    }

    //질문 삭제
    @DeleteMapping("/{qnaId}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long qnaId) {
        qnaService.deleteQuestion(qnaId);
        return ResponseEntity.ok().build();
    }


}
