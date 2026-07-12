package com.fehmidev.projectmanagement.config;

import static org.springframework.security.config.Customizer.withDefaults;

import com.fehmidev.projectmanagement.security.*;
import com.fehmidev.projectmanagement.web.filter.SpaWebFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer.FrameOptionsConfig;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.web.BearerTokenAuthenticationEntryPoint;
import org.springframework.security.oauth2.server.resource.web.access.BearerTokenAccessDeniedHandler;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.security.web.servlet.util.matcher.MvcRequestMatcher;
import org.springframework.web.servlet.handler.HandlerMappingIntrospector;
import tech.jhipster.config.JHipsterProperties;

@Configuration
@EnableMethodSecurity(securedEnabled = true)
public class SecurityConfiguration {

    private final JHipsterProperties jHipsterProperties;

    public SecurityConfiguration(JHipsterProperties jHipsterProperties) {
        this.jHipsterProperties = jHipsterProperties;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, MvcRequestMatcher.Builder mvc) throws Exception {
        http
            .cors(withDefaults())
            .csrf(csrf -> csrf.disable())
            .addFilterAfter(new SpaWebFilter(), BasicAuthenticationFilter.class)
            .headers(headers ->
                headers
                    // Updated Content Security Policy to support Firebase Cloud Messaging & Ngrok
                    .contentSecurityPolicy(csp ->
                        csp.policyDirectives(
                            "default-src 'self'; " +
                            "frame-src 'self' data:; " +
                            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://storage.googleapis.com https://kit.fontawesome.com; " +
                            "style-src 'self' 'unsafe-inline' https://pro.fontawesome.com; " +
                            "img-src 'self' data:; " +
                            "font-src 'self' data: https://fonts.gstatic.com https://ka-f.fontawesome.com; " +
                            "connect-src 'self' https://outburst-rocket-provoke.ngrok-free.dev capacitor://localhost http://localhost;"
                        )
                    )
                    .frameOptions(FrameOptionsConfig::sameOrigin)
                    .referrerPolicy(referrer -> referrer.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                    .permissionsPolicyHeader(permissions ->
                        permissions.policy(
                            "camera=(), fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), sync-xhr=()"
                        )
                    )
            )
            .authorizeHttpRequests(authz ->
                authz
                    // Static Assets
                    .requestMatchers(
                        mvc.pattern("/index.html"),
                        mvc.pattern("/*.js"),
                        mvc.pattern("/*.txt"),
                        mvc.pattern("/*.json"),
                        mvc.pattern("/*.map"),
                        mvc.pattern("/*.css")
                    )
                    .permitAll()
                    .requestMatchers(
                        mvc.pattern("/*.ico"),
                        mvc.pattern("/*.png"),
                        mvc.pattern("/*.svg"),
                        mvc.pattern("/*.webapp"),
                        mvc.pattern("/manifest.webapp")
                    )
                    .permitAll()
                    .requestMatchers(mvc.pattern("/app/**"))
                    .permitAll()
                    .requestMatchers(mvc.pattern("/i18n/**"))
                    .permitAll()
                    .requestMatchers(mvc.pattern("/content/**"))
                    .permitAll()
                    .requestMatchers(mvc.pattern("/swagger-ui/**"))
                    .permitAll()
                    // Public API Endpoints
                    .requestMatchers(mvc.pattern(HttpMethod.POST, "/api/authenticate"))
                    .permitAll()
                    .requestMatchers(mvc.pattern(HttpMethod.GET, "/api/authenticate"))
                    .permitAll()
                    .requestMatchers(mvc.pattern("/api/register"))
                    .permitAll()
                    .requestMatchers(mvc.pattern("/api/activate"))
                    .permitAll()
                    .requestMatchers(mvc.pattern("/api/account/reset-password/init"))
                    .permitAll()
                    .requestMatchers(mvc.pattern("/api/account/reset-password/finish"))
                    .permitAll()
                    // FCM / Push API Rules (Public vs Authenticated)
                    .requestMatchers(mvc.pattern("/api/push/send"))
                    .permitAll() // Permitted publicly based on your snippet
                    .requestMatchers(mvc.pattern("/api/push/fcm-token"))
                    .authenticated()
                    // Management & Administration
                    .requestMatchers(mvc.pattern("/api/admin/**"))
                    .hasAuthority(AuthoritiesConstants.ADMIN)
                    .requestMatchers(mvc.pattern("/v3/api-docs/**"))
                    .hasAuthority(AuthoritiesConstants.ADMIN)
                    .requestMatchers(mvc.pattern("/management/health"))
                    .permitAll()
                    .requestMatchers(mvc.pattern("/management/health/**"))
                    .permitAll()
                    .requestMatchers(mvc.pattern("/management/info"))
                    .permitAll()
                    .requestMatchers(mvc.pattern("/management/prometheus"))
                    .permitAll()
                    .requestMatchers(mvc.pattern("/management/**"))
                    .hasAuthority(AuthoritiesConstants.ADMIN)
                    // Fallback Authenticated Matcher
                    .requestMatchers(mvc.pattern("/api/**"))
                    .authenticated()
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(exceptions ->
                exceptions
                    .authenticationEntryPoint(new BearerTokenAuthenticationEntryPoint())
                    .accessDeniedHandler(new BearerTokenAccessDeniedHandler())
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(withDefaults()));

        return http.build();
    }

    @Bean
    MvcRequestMatcher.Builder mvc(HandlerMappingIntrospector introspector) {
        return new MvcRequestMatcher.Builder(introspector);
    }
}
