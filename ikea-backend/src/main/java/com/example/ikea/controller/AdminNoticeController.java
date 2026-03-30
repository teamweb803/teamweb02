package com.example.ikea.controller;

import com.example.ikea.dto.NoticeRequestDto;
import com.example.ikea.service.NoticeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/admin/notice")
@RequiredArgsConstructor
public class AdminNoticeController {

    public final NoticeService noticeService;

    //공시사항 등록
    @PostMapping
    public ResponseEntity<Long> createNotice(@RequestPart @Valid NoticeRequestDto dto,
                                             @RequestPart(required = false) List<MultipartFile> files) throws IOException {
        return ResponseEntity.ok(noticeService.createNotice(dto, files));
    }

    //공지사항 수정
    @PatchMapping("/{noticeId}")
    public ResponseEntity<Void> updateNotice(@PathVariable long noticeId,
                                             @RequestPart @Valid NoticeRequestDto dto,
                                             @RequestPart(required = false) List<MultipartFile> files) throws IOException {
        noticeService.updateNotice(noticeId, dto, files);
        return ResponseEntity.ok().build();
    }

    //공지사항 삭제
    @DeleteMapping("/{noticeId}")
    public ResponseEntity<Void> deleteNotice(@PathVariable long noticeId) {
        noticeService.deleteNotice(noticeId);
        return ResponseEntity.ok().build();
    }

    //대시보드용 공지사항 수
    @GetMapping("/count")
    public ResponseEntity<Long> getCountNotice() {
        return ResponseEntity.ok(noticeService.getNoticeCount());
    }
}
