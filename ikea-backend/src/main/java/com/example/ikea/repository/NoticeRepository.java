package com.example.ikea.repository;

import com.example.ikea.domain.Notice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NoticeRepository extends JpaRepository<Notice, Long> {

    //제목 검색
    List<Notice> findByTitleContaining(String title);
}
