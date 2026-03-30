package com.example.ikea.controller;

import com.example.ikea.dto.NoticeResponseDto;
import com.example.ikea.service.NoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/notice")
@RequiredArgsConstructor
public class NoticeController {

    public final NoticeService noticeService;

    //공지사항 목록 조회
    @GetMapping
    public ResponseEntity<List<NoticeResponseDto>> getNoticeList() {
        return ResponseEntity.ok(noticeService.getNoticeList());
    }

    //공지사항 상세보기
    @GetMapping("/{noticeId}")
    public ResponseEntity<NoticeResponseDto> getNotice(@PathVariable Long noticeId) {
        return ResponseEntity.ok(noticeService.getNotice(noticeId));
    }


}
