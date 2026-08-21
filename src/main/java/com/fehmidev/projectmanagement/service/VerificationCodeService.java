package com.fehmidev.projectmanagement.service;

import com.fehmidev.projectmanagement.domain.User;
import com.fehmidev.projectmanagement.domain.VerificationCode;
import com.fehmidev.projectmanagement.repository.UserRepository;
import com.fehmidev.projectmanagement.repository.VerificationCodeRepository;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Handles generation and verification of the 6-digit email verification codes issued at
 * registration time (replacing the old activation-link flow).
 */
@Service
@Transactional
public class VerificationCodeService {

    private static final Logger LOG = LoggerFactory.getLogger(VerificationCodeService.class);

    private static final int CODE_LENGTH = 6;

    // Configurable validity window for a code.
    private static final long CODE_VALIDITY_MINUTES = 10;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final VerificationCodeRepository verificationCodeRepository;

    private final UserRepository userRepository;

    public VerificationCodeService(VerificationCodeRepository verificationCodeRepository, UserRepository userRepository) {
        this.verificationCodeRepository = verificationCodeRepository;
        this.userRepository = userRepository;
    }

    /**
     * Invalidates any still-usable codes for this user and issues a brand new one.
     *
     * @param user the user to generate a code for.
     * @return the newly generated plain-text code, to be emailed (never returned by an API response).
     */
    public String generateCodeFor(User user) {
        invalidateExistingCodes(user);
        String code = generateNumericCode();
        VerificationCode verificationCode = new VerificationCode();
        verificationCode.setUser(user);
        verificationCode.setCode(code);
        verificationCode.setExpiryDate(Instant.now().plus(CODE_VALIDITY_MINUTES, ChronoUnit.MINUTES));
        verificationCode.setUsed(false);
        verificationCode.setCreatedDate(Instant.now());
        verificationCodeRepository.save(verificationCode);
        LOG.debug("Generated verification code for user '{}'", user.getLogin());
        return code;
    }

    /**
     * Verifies the given code for the given login/email. On success, activates the user and
     * marks the code as used in the same transaction.
     *
     * @return the activated user, or empty if the login/email is unknown, or the code is missing/expired/used/mismatched.
     */
    public Optional<User> verifyCode(String loginOrEmail, String code) {
        return resolveUser(loginOrEmail).flatMap(user ->
            verificationCodeRepository
                .findFirstByUserAndCodeAndUsedIsFalseOrderByCreatedDateDesc(user, code)
                .filter(vc -> vc.getExpiryDate().isAfter(Instant.now()))
                .map(vc -> {
                    vc.setUsed(true);
                    verificationCodeRepository.save(vc);
                    user.setActivated(true);
                    userRepository.save(user);
                    LOG.debug("Verified code and activated user '{}'", user.getLogin());
                    return user;
                })
        );
    }

    /**
     * Resends a fresh code to an existing, not-yet-activated user. Silently no-ops for an
     * unknown login/email or an already-activated account, mirroring the password-reset
     * endpoint's pattern of not leaking account existence.
     */
    public Optional<UserAndCode> resendCodeFor(String loginOrEmail) {
        return resolveUser(loginOrEmail).filter(user -> !user.isActivated()).map(user -> new UserAndCode(user, generateCodeFor(user)));
    }

    private Optional<User> resolveUser(String loginOrEmail) {
        if (loginOrEmail == null || loginOrEmail.isBlank()) {
            return Optional.empty();
        }
        return userRepository.findOneByEmailIgnoreCase(loginOrEmail).or(() -> userRepository.findOneByLogin(loginOrEmail.toLowerCase()));
    }

    private void invalidateExistingCodes(User user) {
        verificationCodeRepository.findAllByUserAndUsedIsFalse(user).forEach(vc -> vc.setUsed(true));
    }

    private static String generateNumericCode() {
        StringBuilder sb = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            sb.append(SECURE_RANDOM.nextInt(10));
        }
        return sb.toString();
    }

    /** Pairs a user with the fresh code generated for them, so AccountResource can email it without a second lookup. */
    public static class UserAndCode {

        private final User user;
        private final String code;

        public UserAndCode(User user, String code) {
            this.user = user;
            this.code = code;
        }

        public User getUser() {
            return user;
        }

        public String getCode() {
            return code;
        }
    }
}
