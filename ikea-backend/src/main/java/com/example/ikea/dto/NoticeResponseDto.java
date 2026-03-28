package com.example.ikea.dto;

import com.example.ikea.domain.Notice;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
public class NoticeResponseDto {

    private Long noticeId;

    private String title;

    private String content;

    private String writer;

    private Integer viewCount;

    private List<NoticeAttachmentDto> attachments;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public NoticeResponseDto(Notice notice) {
        this.noticeId = notice.getNoticeId();
        this.title = notice.getTitle();
        this.content = notice.getContent();
        this.writer = notice.getWriter();
        this.viewCount = notice.getViewCount();
        this.attachments = notice.getAttachments().stream()
                .map(NoticeAttachmentDto::new)
                .collect(Collectors.toList());
        this.createdAt = notice.getCreatedAt();
        this.updatedAt = notice.getUpdatedAt();
    }
}
