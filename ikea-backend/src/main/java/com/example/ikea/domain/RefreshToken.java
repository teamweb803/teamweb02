package com.example.ikea.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "refresh_tokens")
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long refreshTokenId;

    @Column(nullable = false, unique = true)
    private String loginId;

    @Column(nullable = false)
    private String refreshToken;

    @Column(nullable = false)
    private String memberRole;
}
