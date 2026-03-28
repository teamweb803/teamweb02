package com.example.ikea.dto;

import com.example.ikea.domain.NoticeAttachment;
import lombok.Getter;

@Getter
public class NoticeAttachmentDto {

    private Long noticeAttachmentId;
    private String originalName;
    private String fileUrl;
    private String contentType;
    private Long fileSize;

    public NoticeAttachmentDto(NoticeAttachment noticeAttachment) {
        this.noticeAttachmentId = noticeAttachment.getNoticeAttachmentId();
        this.originalName = noticeAttachment.getOriginalName();
        this.fileUrl = noticeAttachment.getFileUrl();
        this.contentType = noticeAttachment.getContentType();
        this.fileSize = noticeAttachment.getFileSize();
    }
}
