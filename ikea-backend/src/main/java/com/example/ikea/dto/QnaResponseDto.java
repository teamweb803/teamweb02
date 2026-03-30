package com.example.ikea.dto;

import com.example.ikea.domain.Qna;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class QnaResponseDto {
    private Long qnaId;
    private String title;
    private String content;
    private String writer;
    private Integer level;
    private Long parentId;
    private int viewCount;
    private LocalDateTime createdAt;

    public QnaResponseDto(Qna qna) {
        this.qnaId = qna.getQnaId();
        this.title = qna.getTitle();
        this.content = qna.getContent();
        this.writer = qna.getWriter();
        this.level = qna.getLevel();
        this.parentId = qna.getParentId();
        this.viewCount = qna.getViewCount();
        this.createdAt = qna.getCreatedAt();
    }
}