package com.fehmidev.projectmanagement.web.rest;

import com.fehmidev.projectmanagement.domain.Attachment;
import com.fehmidev.projectmanagement.domain.User;
import com.fehmidev.projectmanagement.domain.enumeration.AttachmentCategory;
import com.fehmidev.projectmanagement.repository.AttachmentRepository;
import com.fehmidev.projectmanagement.repository.UserRepository;
import com.fehmidev.projectmanagement.security.SecurityUtils;
import com.fehmidev.projectmanagement.service.FileStorageService;
import com.fehmidev.projectmanagement.service.FileStorageService.StoredFile;
import com.fehmidev.projectmanagement.service.MailService;
import com.fehmidev.projectmanagement.service.UserService;
import com.fehmidev.projectmanagement.service.VerificationCodeService;
import com.fehmidev.projectmanagement.service.dto.AdminUserDTO;
import com.fehmidev.projectmanagement.service.dto.PasswordChangeDTO;
import com.fehmidev.projectmanagement.web.rest.errors.*;
import com.fehmidev.projectmanagement.web.rest.vm.KeyAndPasswordVM;
import com.fehmidev.projectmanagement.web.rest.vm.ManagedUserVM;
import com.fehmidev.projectmanagement.web.rest.vm.ResendCodeVM;
import com.fehmidev.projectmanagement.web.rest.vm.VerifyCodeVM;
import jakarta.validation.Valid;
import java.time.Instant;
import java.util.*;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * REST controller for managing the current user's account.
 */
@RestController
@RequestMapping("/api")
public class AccountResource {

    private static class AccountResourceException extends RuntimeException {

        private AccountResourceException(String message) {
            super(message);
        }
    }

    private static final Logger LOG = LoggerFactory.getLogger(AccountResource.class);

    private static final long MAX_PICTURE_SIZE_BYTES = 5L * 1024 * 1024; // 5 MB

    private static final Set<String> ALLOWED_PICTURE_CONTENT_TYPES = Set.of("image/png", "image/jpeg", "image/webp");

    private final UserRepository userRepository;

    private final UserService userService;

    private final MailService mailService;

    private final VerificationCodeService verificationCodeService;

    // NEW: needed to store the raw file bytes for an uploaded profile picture.
    private final FileStorageService fileStorageService;

    // NEW: needed to create the unlinked Attachment row for an uploaded profile picture,
    // ahead of the Employee/User existing.
    private final AttachmentRepository attachmentRepository;

    public AccountResource(
        UserRepository userRepository,
        UserService userService,
        MailService mailService,
        VerificationCodeService verificationCodeService,
        FileStorageService fileStorageService,
        AttachmentRepository attachmentRepository
    ) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.mailService = mailService;
        this.verificationCodeService = verificationCodeService;
        this.fileStorageService = fileStorageService;
        this.attachmentRepository = attachmentRepository;
    }

    /**
     * {@code POST  /account/upload-picture} : upload a profile picture ahead of registration.
     * <p>
     * Stores the file and creates an unlinked {@link Attachment} (no employee yet, since
     * registration hasn't completed). The returned {@code attachmentId} must be sent back with
     * the {@code /register} call (as {@code ManagedUserVM.pictureAttachmentId}) so the backend
     * can link it to the newly created Employee and populate the new User's imageUrl.
     *
     * @param file the uploaded image (PNG, JPEG, or WEBP, max 5MB).
     * @return the created attachment's id and public URL.
     */
    @PostMapping("/account/upload-picture")
    public ResponseEntity<Map<String, Object>> uploadProfilePicture(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AccountResourceException("No file provided");
        }
        if (file.getSize() > MAX_PICTURE_SIZE_BYTES) {
            throw new AccountResourceException("File exceeds the maximum allowed size of 5MB");
        }
        if (file.getContentType() == null || !ALLOWED_PICTURE_CONTENT_TYPES.contains(file.getContentType())) {
            throw new AccountResourceException("Only PNG, JPEG, or WEBP images are allowed");
        }

        StoredFile stored = fileStorageService.store(file, "profile-pictures");

        Attachment attachment = new Attachment();
        attachment.setFileName(stored.originalFilename());
        attachment.setFileUrl(stored.publicUrl());
        attachment.setFileType(stored.contentType());
        attachment.setFileSize(stored.size());
        attachment.setUploadedDate(Instant.now());
        attachment.setCategory(AttachmentCategory.PROFILE_PICTURE);
        // employee intentionally left null - linked later once registration creates the Employee.
        attachment = attachmentRepository.save(attachment);

        LOG.debug("Stored profile picture attachment {} at {}", attachment.getId(), attachment.getFileUrl());
        return ResponseEntity.ok(Map.of("attachmentId", attachment.getId(), "fileUrl", attachment.getFileUrl()));
    }

    /**
     * {@code POST  /register} : register the user.
     *
     * @param managedUserVM the managed user View Model.
     * @throws InvalidPasswordException {@code 400 (Bad Request)} if the password is incorrect.
     * @throws EmailAlreadyUsedException {@code 400 (Bad Request)} if the email is already used.
     * @throws LoginAlreadyUsedException {@code 400 (Bad Request)} if the login is already used.
     */
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Map<String, String>> registerAccount(@Valid @RequestBody ManagedUserVM managedUserVM) {
        if (isPasswordLengthInvalid(managedUserVM.getPassword())) {
            throw new InvalidPasswordException();
        }
        User user = userService.registerUser(
            managedUserVM,
            managedUserVM.getPassword(),
            managedUserVM.getPhone(),
            managedUserVM.getPictureAttachmentId()
        );
        String code = verificationCodeService.generateCodeFor(user);
        mailService.sendVerificationCodeEmail(user, code);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("login", user.getLogin(), "email", user.getEmail()));
    }

    /**
     * {@code POST  /account/verify-code} : verify the 6-digit code sent at registration and activate the account.
     *
     * @param verifyCodeVM the login/email and the submitted code.
     * @throws RuntimeException {@code 500 (Internal Server Error)} if the code is invalid, expired, or already used.
     */
    @PostMapping("/account/verify-code")
    public void verifyCode(@Valid @RequestBody VerifyCodeVM verifyCodeVM) {
        Optional<User> user = verificationCodeService.verifyCode(verifyCodeVM.getLogin(), verifyCodeVM.getCode());
        if (!user.isPresent()) {
            throw new AccountResourceException("Invalid or expired verification code");
        }
    }

    /**
     * {@code POST  /account/resend-verification-code} : issue and email a fresh verification code.
     * Always returns 200 regardless of whether the login/email exists, to avoid leaking account existence.
     *
     * @param resendCodeVM the login/email to resend a code to.
     */
    @PostMapping("/account/resend-verification-code")
    public void resendVerificationCode(@Valid @RequestBody ResendCodeVM resendCodeVM) {
        verificationCodeService
            .resendCodeFor(resendCodeVM.getLogin())
            .ifPresentOrElse(
                userAndCode -> mailService.sendVerificationCodeEmail(userAndCode.getUser(), userAndCode.getCode()),
                () -> LOG.warn("Verification code resend requested for unknown or already-activated account")
            );
    }

    /**
     * {@code GET  /activate} : activate the registered user (legacy link-based flow, left in place but unused by the new frontend).
     *
     * @param key the activation key.
     * @throws RuntimeException {@code 500 (Internal Server Error)} if the user couldn't be activated.
     */
    @GetMapping("/activate")
    public void activateAccount(@RequestParam(value = "key") String key) {
        Optional<User> user = userService.activateRegistration(key);
        if (!user.isPresent()) {
            throw new AccountResourceException("No user was found for this activation key");
        }
    }

    /**
     * {@code GET  /account} : get the current user.
     *
     * @return the current user.
     * @throws RuntimeException {@code 500 (Internal Server Error)} if the user couldn't be returned.
     */
    @GetMapping("/account")
    public AdminUserDTO getAccount() {
        return userService
            .getUserWithAuthorities()
            .map(AdminUserDTO::new)
            .orElseThrow(() -> new AccountResourceException("User could not be found"));
    }

    /**
     * {@code POST  /account} : update the current user information.
     *
     * @param userDTO the current user information.
     * @throws EmailAlreadyUsedException {@code 400 (Bad Request)} if the email is already used.
     * @throws RuntimeException {@code 500 (Internal Server Error)} if the user login wasn't found.
     */
    @PostMapping("/account")
    public void saveAccount(@Valid @RequestBody AdminUserDTO userDTO) {
        String userLogin = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new AccountResourceException("Current user login not found"));
        Optional<User> existingUser = userRepository.findOneByEmailIgnoreCase(userDTO.getEmail());
        if (existingUser.isPresent() && (!existingUser.orElseThrow().getLogin().equalsIgnoreCase(userLogin))) {
            throw new EmailAlreadyUsedException();
        }
        Optional<User> user = userRepository.findOneByLogin(userLogin);
        if (!user.isPresent()) {
            throw new AccountResourceException("User could not be found");
        }
        userService.updateUser(
            userDTO.getFirstName(),
            userDTO.getLastName(),
            userDTO.getEmail(),
            userDTO.getLangKey(),
            userDTO.getImageUrl()
        );
    }

    /**
     * {@code POST  /account/change-password} : changes the current user's password.
     *
     * @param passwordChangeDto current and new password.
     * @throws InvalidPasswordException {@code 400 (Bad Request)} if the new password is incorrect.
     */
    @PostMapping(path = "/account/change-password")
    public void changePassword(@RequestBody PasswordChangeDTO passwordChangeDto) {
        if (isPasswordLengthInvalid(passwordChangeDto.getNewPassword())) {
            throw new InvalidPasswordException();
        }
        userService.changePassword(passwordChangeDto.getCurrentPassword(), passwordChangeDto.getNewPassword());
    }

    /**
     * {@code POST   /account/reset-password/init} : Send an email to reset the password of the user.
     *
     * @param mail the mail of the user.
     */
    @PostMapping(path = "/account/reset-password/init")
    public void requestPasswordReset(@RequestBody String mail) {
        Optional<User> user = userService.requestPasswordReset(mail);
        if (user.isPresent()) {
            mailService.sendPasswordResetMail(user.orElseThrow());
        } else {
            LOG.warn("Password reset requested for non existing mail");
        }
    }

    /**
     * {@code POST   /account/reset-password/finish} : Finish to reset the password of the user.
     *
     * @param keyAndPassword the generated key and the new password.
     * @throws InvalidPasswordException {@code 400 (Bad Request)} if the password is incorrect.
     * @throws RuntimeException {@code 500 (Internal Server Error)} if the password could not be reset.
     */
    @PostMapping(path = "/account/reset-password/finish")
    public void finishPasswordReset(@RequestBody KeyAndPasswordVM keyAndPassword) {
        if (isPasswordLengthInvalid(keyAndPassword.getNewPassword())) {
            throw new InvalidPasswordException();
        }
        Optional<User> user = userService.completePasswordReset(keyAndPassword.getNewPassword(), keyAndPassword.getKey());

        if (!user.isPresent()) {
            throw new AccountResourceException("No user was found for this reset key");
        }
    }

    private static boolean isPasswordLengthInvalid(String password) {
        return (
            StringUtils.isEmpty(password) ||
            password.length() < ManagedUserVM.PASSWORD_MIN_LENGTH ||
            password.length() > ManagedUserVM.PASSWORD_MAX_LENGTH
        );
    }
}
