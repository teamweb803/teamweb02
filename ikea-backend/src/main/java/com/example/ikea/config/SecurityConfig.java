package com.example.ikea.config;

import com.example.ikea.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // CSRF 비활성화 (JWT 방식에선 불필요)
                .csrf(csrf -> csrf.disable())

                // CORS 설정 (Vue 연동)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 세션 사용 안함 (JWT는 Stateless)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // URL 별 권한 설정
                .authorizeHttpRequests(auth -> auth
                    // 누구나 접근 가능
                                .requestMatchers(
                                        "/api/auth/**",
                                        "/api/member/join",
                                        "/api/member/login",
                                        "/api/product/**",
                                        "/api/category/**",
                                        "/api/notice/**"
                                ).permitAll()

                        // Qna : 조회만 공개, 나머지는 로그인
                                .requestMatchers(HttpMethod.GET, "/api/qna/**").permitAll()
                                .requestMatchers(HttpMethod.POST, "/api/qna/**").authenticated()
                                .requestMatchers(HttpMethod.PUT, "/api/qna/**").authenticated()
                                .requestMatchers(HttpMethod.DELETE, "/api/qna/**").authenticated()
                        // Review: 조회만 공개, 나머지는 로그인
                                .requestMatchers(HttpMethod.GET, "/api/review/**").permitAll()
                                .requestMatchers(HttpMethod.POST, "/api/review/**").authenticated()
                                .requestMatchers(HttpMethod.PUT, "/api/review/**").authenticated()
                                .requestMatchers(HttpMethod.DELETE, "/api/review/**").authenticated()

                                //결제시 로그인 필요
                                .requestMatchers("/api/payment/**").authenticated()
                                //관리자만 접근 가능
                                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                                //나머지는 로그인 필요
                                .anyRequest().authenticated()
                         )

                // JWT 필터 등록
                .addFilterBefore(jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }


    // CORS 설정
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of("http://localhost:5173")); //Vue 기본 포트
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration) throws  Exception {
        return configuration.getAuthenticationManager();
    }
}
