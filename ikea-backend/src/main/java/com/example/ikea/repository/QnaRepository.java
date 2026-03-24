package com.example.ikea.repository;

import com.example.ikea.domain.Qna;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface QnaRepository extends JpaRepository<Qna, Long> {

    // 전체 목록 (그룹핑)
    @Query("SELECT q FROM Qna q ORDER BY q.parentId DESC, q.level ASC, q.createdAt ASC")
    List<Qna> findAllGrouped();

    //제목 검색
    @Query("""
            SELECT q FROM Qna q WHERE q.title LIKE %title%
            ORDER BY q.parentId DESC, q.level ASC, q.createdAt ASC
            """)
    List<Qna> findByTitle(String title);

    // 특정 질문의 답변 목록
    List<Qna> findByParentIdOrderByLevelAscCreatedAtAsc(Long parentId);

    //질문 삭제시 답변도 삭제
    void deleteByParentId(Long parentId);


}
