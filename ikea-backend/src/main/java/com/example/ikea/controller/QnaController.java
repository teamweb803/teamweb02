package com.example.ikea.controller;

import com.example.ikea.domain.Qna;
import com.example.ikea.dto.QnaRequestDto;
import com.example.ikea.dto.QnaResponseDto;
import com.example.ikea.service.QnaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/qna")
@RequiredArgsConstructor
public class QnaController {

    private final QnaService qnaService;

    // 전체 목록
    @GetMapping
    public ResponseEntity<List<QnaResponseDto>> getQnaList() {
        return ResponseEntity.ok(qnaService.getQnaList());
    }

    // 제목 검색
    @GetMapping("/search")
    public ResponseEntity<List<QnaResponseDto>> searchQna(@RequestParam String title) {
        return ResponseEntity.ok(qnaService.searchQna(title));
    }

    // 질문 상세 + 답변 목록
    @GetMapping("/{qnaId}")
    public ResponseEntity<Map<String, Object>> getQna(@PathVariable Long qnaId) {
        QnaResponseDto question = qnaService.getQna(qnaId);
        List<QnaResponseDto> answers = qnaService.getAnswerList(question.getQnaId());

        Map<String, Object> response = new HashMap<>();
        response.put("question", question);
        response.put("answers", answers);

        return ResponseEntity.ok(response);
    }

    // 질문 등록
    @PostMapping
    public ResponseEntity<Long> createQna(@RequestBody @Valid QnaRequestDto dto) {
        return ResponseEntity.ok(qnaService.createQna(dto));
    }

    // 질문 수정
    @PutMapping("/{qnaId}")
    public ResponseEntity<Void> updateQna(@PathVariable Long qnaId,
                                          @RequestBody @Valid QnaRequestDto dto) {
        qnaService.updateQna(qnaId, dto);
        return ResponseEntity.ok().build();
    }

    // 질문 삭제
    @DeleteMapping("/{qnaId}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long qnaId) {
        qnaService.deleteQuestion(qnaId);
        return ResponseEntity.ok().build();
    }
}