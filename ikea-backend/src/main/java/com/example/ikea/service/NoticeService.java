package com.example.ikea.service;

import com.example.ikea.domain.Notice;
import com.example.ikea.domain.NoticeAttachment;
import com.example.ikea.dto.NoticeRequestDto;
import com.example.ikea.dto.NoticeResponseDto;
import com.example.ikea.repository.NoticeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NoticeService {

    private final NoticeRepository noticeRepository;

    //공지사항 목록 조회
    public List<NoticeResponseDto> getNoticeList() {
        return noticeRepository.findAll()
                .stream()
                .map(NoticeResponseDto::new)
                .collect(Collectors.toList());
    }

    //공지사항 상세 보기 + 조회수 증가
    @Transactional
    public NoticeResponseDto getNotice(Long noticeId) {
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new IllegalStateException("존재하지 않는 공지사항입니다."));
        notice.setViewCount(notice.getViewCount() + 1);
        return new NoticeResponseDto(notice);
    }

    // ============== 관리자 ==================

    //공지사항 등록
    @Transactional
    public Long createNotice(NoticeRequestDto dto, List<MultipartFile> files) throws IOException {
        Notice notice = Notice.builder()
                .title(dto.getTitle())
                .content(dto.getContent())
                .writer(dto.getWriter())
                .build();
        noticeRepository.save(notice);

        //첨부파일 처리
        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                if (file != null && !file.isEmpty()) {
                    NoticeAttachment noticeAttachment = NoticeAttachment.builder()
                            .originalName(file.getOriginalFilename())
                            .storedName(UUID.randomUUID() + "_" + file.getOriginalFilename())
                            .fileUrl(saveFile(file))
                            .contentType(file.getContentType())
                            .fileSize(file.getSize())
                            .fileData(file.getBytes())
                            .build();
                    notice.addAttachment(noticeAttachment);
                }
            }
        }
        return notice.getNoticeId();
    }

    //공지사항 수정
    @Transactional
    public void updateNotice(Long noticeId, NoticeRequestDto dto,
                             List<MultipartFile> files) throws IOException {
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new IllegalStateException("존재하는 공지사항이 아닙니다."));
        notice.setTitle(dto.getTitle());
        notice.setContent(dto.getContent());
        notice.setWriter(dto.getWriter());

        // 새 첨부파일 추가
        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                if (file != null && !file.isEmpty()) {
                    NoticeAttachment noticeAttachment = NoticeAttachment.builder()
                            .originalName(file.getOriginalFilename())
                            .storedName(UUID.randomUUID() + "_" + file.getOriginalFilename())
                            .fileUrl(saveFile(file))
                            .contentType(file.getContentType())
                            .fileSize(file.getSize())
                            .fileData(file.getBytes())
                            .build();
                    notice.addAttachment(noticeAttachment);

                }
            }
        }
    }

    //공지사항 삭제
    @Transactional
    public void deleteNotice(Long noticeId) {
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new IllegalStateException("존재하는 공지사항이 아닙니다."));
        noticeRepository.delete(notice);
    }

    //대시보드용 공지사항 수
    public Long getNoticeCount() {
        return noticeRepository.count();
    }


    // =============== 파일 처리 ==================

    private String saveFile(MultipartFile file) throws IOException {
        String uploadDir = "src/main/resources/static/uploads/notices/";
        File dir = new File(uploadDir);

        if(!dir.exists() && !dir.mkdirs()) {
            throw new IOException("업로드 폴더 생성에 실패했습니다.");
        }

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        file.transferTo(new File(uploadDir + fileName));

        return "/uploads/notices/" + fileName;
    }


}
