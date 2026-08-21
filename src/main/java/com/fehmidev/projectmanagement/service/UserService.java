package com.fehmidev.projectmanagement.service;

import com.fehmidev.projectmanagement.config.Constants;
import com.fehmidev.projectmanagement.domain.Authority;
import com.fehmidev.projectmanagement.domain.Employee;
import com.fehmidev.projectmanagement.domain.User;
import com.fehmidev.projectmanagement.repository.AuthorityRepository;
import com.fehmidev.projectmanagement.repository.EmployeeRepository;
import com.fehmidev.projectmanagement.repository.UserRepository;
import com.fehmidev.projectmanagement.repository.UserSpecification;
import com.fehmidev.projectmanagement.security.AuthoritiesConstants;
import com.fehmidev.projectmanagement.security.SecurityUtils;
import com.fehmidev.projectmanagement.service.dto.AdminUserDTO;
import com.fehmidev.projectmanagement.service.dto.UserDTO;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.CacheManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.jhipster.security.RandomUtil;

/**
 * Service class for managing users.
 */
@Service
@Transactional
public class UserService {

    private static final Logger LOG = LoggerFactory.getLogger(UserService.class);

    // NEW: pattern used to parse existing employee numbers ("EMP-001", "EMP-0042", ...)
    // when computing the next sequence value for auto-created employees.
    private static final Pattern EMPLOYEE_NUMBER_PATTERN = Pattern.compile("^EMP-(\\d+)$");

    // NEW: default job title assigned to employees auto-created at registration time,
    // since the registration form does not collect one. An administrator can update it later.
    private static final String DEFAULT_EMPLOYEE_JOB_TITLE = "Not assigned";

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final AuthorityRepository authorityRepository;

    private final CacheManager cacheManager;

    // NEW: needed to auto-create an Employee record for every self-registered User.
    private final EmployeeRepository employeeRepository;

    public UserService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        AuthorityRepository authorityRepository,
        CacheManager cacheManager,
        EmployeeRepository employeeRepository
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authorityRepository = authorityRepository;
        this.cacheManager = cacheManager;
        this.employeeRepository = employeeRepository;
    }

    public Optional<User> activateRegistration(String key) {
        LOG.debug("Activating user for activation key {}", key);
        return userRepository
            .findOneByActivationKey(key)
            .map(user -> {
                // activate given user for the registration key.
                user.setActivated(true);
                user.setActivationKey(null);
                this.clearUserCaches(user);
                LOG.debug("Activated user: {}", user);
                return user;
            });
    }

    public Optional<User> completePasswordReset(String newPassword, String key) {
        LOG.debug("Reset user password for reset key {}", key);
        return userRepository
            .findOneByResetKey(key)
            .filter(user -> user.getResetDate().isAfter(Instant.now().minus(1, ChronoUnit.DAYS)))
            .map(user -> {
                user.setPassword(passwordEncoder.encode(newPassword));
                user.setResetKey(null);
                user.setResetDate(null);
                this.clearUserCaches(user);
                return user;
            });
    }

    public Optional<User> requestPasswordReset(String mail) {
        return userRepository
            .findOneByEmailIgnoreCase(mail)
            .filter(User::isActivated)
            .map(user -> {
                user.setResetKey(RandomUtil.generateResetKey());
                user.setResetDate(Instant.now());
                this.clearUserCaches(user);
                return user;
            });
    }

    public User registerUser(AdminUserDTO userDTO, String password) {
        return registerUser(userDTO, password, null);
    }

    // NEW: overload accepting the phone number captured on the registration form,
    // forwarded to the auto-created Employee record.
    public User registerUser(AdminUserDTO userDTO, String password, String phone) {
        // NEW: the frontend now auto-generates the login as "firstname.lastname" instead of the
        // user typing one, so two people with the same name produce the same candidate login.
        // Rather than reject the second registration outright, append a numeric suffix
        // (john.doe, john.doe2, john.doe3, ...) until a free login is found. An active user
        // still holding the base login blocks reuse of that exact candidate; a stale,
        // never-activated registration is freed up and reused immediately, exactly as before.
        String resolvedLogin = resolveUniqueLogin(userDTO.getLogin().toLowerCase());
        userRepository
            .findOneByEmailIgnoreCase(userDTO.getEmail())
            .ifPresent(existingUser -> {
                boolean removed = removeNonActivatedUser(existingUser);
                if (!removed) {
                    throw new EmailAlreadyUsedException();
                }
            });
        User newUser = new User();
        String encryptedPassword = passwordEncoder.encode(password);
        newUser.setLogin(resolvedLogin);
        // new user gets initially a generated password
        newUser.setPassword(encryptedPassword);
        newUser.setFirstName(userDTO.getFirstName());
        newUser.setLastName(userDTO.getLastName());
        if (userDTO.getEmail() != null) {
            newUser.setEmail(userDTO.getEmail().toLowerCase());
        }
        newUser.setImageUrl(userDTO.getImageUrl());
        newUser.setLangKey(userDTO.getLangKey());
        // new user is not active
        newUser.setActivated(false);
        Set<Authority> authorities = new HashSet<>();
        authorityRepository.findById(AuthoritiesConstants.USER).ifPresent(authorities::add);
        newUser.setAuthorities(authorities);
        userRepository.save(newUser);
        this.clearUserCaches(newUser);
        // NEW: automatically create the matching Employee record for the newly registered user,
        // in the same transaction so we never end up with a User without an Employee.
        createEmployeeForNewUser(newUser, userDTO, phone);
        LOG.debug("Created Information for User: {}", newUser);
        return newUser;
    }

    /**
     * Finds the first available login starting from {@code baseLogin}, appending an
     * incrementing numeric suffix (login, login2, login3, ...) whenever the candidate is
     * already held by an activated user.
     */
    private String resolveUniqueLogin(String baseLogin) {
        String candidate = baseLogin;
        int suffix = 1;
        while (isLoginTaken(candidate)) {
            suffix++;
            candidate = baseLogin + suffix;
        }
        return candidate;
    }

    private boolean isLoginTaken(String login) {
        return userRepository
            .findOneByLogin(login)
            .map(existingUser -> {
                if (existingUser.isActivated()) {
                    return true;
                }
                // stale, never-activated registration holding this login - free it up, same as before
                removeNonActivatedUser(existingUser);
                return false;
            })
            .orElse(false);
    }

    private boolean removeNonActivatedUser(User existingUser) {
        if (existingUser.isActivated()) {
            return false;
        }
        userRepository.delete(existingUser);
        userRepository.flush();
        this.clearUserCaches(existingUser);
        return true;
    }

    public User createUser(AdminUserDTO userDTO) {
        User user = new User();
        user.setLogin(userDTO.getLogin().toLowerCase());
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        if (userDTO.getEmail() != null) {
            user.setEmail(userDTO.getEmail().toLowerCase());
        }
        user.setImageUrl(userDTO.getImageUrl());
        if (userDTO.getLangKey() == null) {
            user.setLangKey(Constants.DEFAULT_LANGUAGE); // default language
        } else {
            user.setLangKey(userDTO.getLangKey());
        }
        String encryptedPassword = passwordEncoder.encode(RandomUtil.generatePassword());
        user.setPassword(encryptedPassword);
        user.setResetKey(RandomUtil.generateResetKey());
        user.setResetDate(Instant.now());
        user.setActivated(true);
        if (userDTO.getAuthorities() != null) {
            Set<Authority> authorities = userDTO
                .getAuthorities()
                .stream()
                .map(authorityRepository::findById)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toSet());
            user.setAuthorities(authorities);
        }
        userRepository.save(user);
        this.clearUserCaches(user);
        LOG.debug("Created Information for User: {}", user);
        return user;
    }

    /**
     * Update all information for a specific user, and return the modified user.
     *
     * @param userDTO user to update.
     * @return updated user.
     */
    public Optional<AdminUserDTO> updateUser(AdminUserDTO userDTO) {
        return Optional.of(userRepository.findById(userDTO.getId()))
            .filter(Optional::isPresent)
            .map(Optional::get)
            .map(user -> {
                this.clearUserCaches(user);
                user.setLogin(userDTO.getLogin().toLowerCase());
                user.setFirstName(userDTO.getFirstName());
                user.setLastName(userDTO.getLastName());
                if (userDTO.getEmail() != null) {
                    user.setEmail(userDTO.getEmail().toLowerCase());
                }
                user.setImageUrl(userDTO.getImageUrl());
                user.setActivated(userDTO.isActivated());
                user.setLangKey(userDTO.getLangKey());
                Set<Authority> managedAuthorities = user.getAuthorities();
                managedAuthorities.clear();
                userDTO
                    .getAuthorities()
                    .stream()
                    .map(authorityRepository::findById)
                    .filter(Optional::isPresent)
                    .map(Optional::get)
                    .forEach(managedAuthorities::add);
                userRepository.save(user);
                this.clearUserCaches(user);
                LOG.debug("Changed Information for User: {}", user);
                return user;
            })
            .map(AdminUserDTO::new);
    }

    public void deleteUser(String login) {
        userRepository
            .findOneByLogin(login)
            .ifPresent(user -> {
                userRepository.delete(user);
                this.clearUserCaches(user);
                LOG.debug("Deleted User: {}", user);
            });
    }

    /**
     * Update basic information (first name, last name, email, language) for the current user.
     *
     * @param firstName first name of user.
     * @param lastName  last name of user.
     * @param email     email id of user.
     * @param langKey   language key.
     * @param imageUrl  image URL of user.
     */
    public void updateUser(String firstName, String lastName, String email, String langKey, String imageUrl) {
        SecurityUtils.getCurrentUserLogin()
            .flatMap(userRepository::findOneByLogin)
            .ifPresent(user -> {
                user.setFirstName(firstName);
                user.setLastName(lastName);
                if (email != null) {
                    user.setEmail(email.toLowerCase());
                }
                user.setLangKey(langKey);
                user.setImageUrl(imageUrl);
                userRepository.save(user);
                this.clearUserCaches(user);
                LOG.debug("Changed Information for User: {}", user);
            });
    }

    @Transactional
    public void changePassword(String currentClearTextPassword, String newPassword) {
        SecurityUtils.getCurrentUserLogin()
            .flatMap(userRepository::findOneByLogin)
            .ifPresent(user -> {
                String currentEncryptedPassword = user.getPassword();
                if (!passwordEncoder.matches(currentClearTextPassword, currentEncryptedPassword)) {
                    throw new InvalidPasswordException();
                }
                String encryptedPassword = passwordEncoder.encode(newPassword);
                user.setPassword(encryptedPassword);
                this.clearUserCaches(user);
                LOG.debug("Changed password for User: {}", user);
            });
    }

    @Transactional(readOnly = true)
    public Page<AdminUserDTO> getAllManagedUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(AdminUserDTO::new);
    }

    @Transactional(readOnly = true)
    public Page<UserDTO> getAllPublicUsers(Pageable pageable) {
        return userRepository.findAllByIdNotNullAndActivatedIsTrue(pageable).map(UserDTO::new);
    }

    @Transactional(readOnly = true)
    public Optional<User> getUserWithAuthoritiesByLogin(String login) {
        return userRepository.findOneWithAuthoritiesByLogin(login);
    }

    @Transactional(readOnly = true)
    public Optional<User> getUserWithAuthorities() {
        return SecurityUtils.getCurrentUserLogin().flatMap(userRepository::findOneWithAuthoritiesByLogin);
    }

    /**
     * Not activated users should be automatically deleted after 3 days.
     * <p>
     * This is scheduled to get fired every day, at 01:00 (am).
     */
    @Scheduled(cron = "0 0 1 * * ?")
    public void removeNotActivatedUsers() {
        userRepository
            .findAllByActivatedIsFalseAndActivationKeyIsNotNullAndCreatedDateBefore(Instant.now().minus(3, ChronoUnit.DAYS))
            .forEach(user -> {
                LOG.debug("Deleting not activated user {}", user.getLogin());
                userRepository.delete(user);
                this.clearUserCaches(user);
            });
    }

    /**
     * Gets a list of all the authorities.
     * @return a list of all the authorities.
     */
    @Transactional(readOnly = true)
    public List<String> getAuthorities() {
        return authorityRepository.findAll().stream().map(Authority::getName).toList();
    }

    private void clearUserCaches(User user) {
        Objects.requireNonNull(cacheManager.getCache(UserRepository.USERS_BY_LOGIN_CACHE)).evictIfPresent(user.getLogin());
        if (user.getEmail() != null) {
            Objects.requireNonNull(cacheManager.getCache(UserRepository.USERS_BY_EMAIL_CACHE)).evictIfPresent(user.getEmail());
        }
    }

    // NEW: filtered
    @Transactional(readOnly = true)
    public Page<AdminUserDTO> getAllManagedUsers(String login, String email, Pageable pageable) {
        Specification<User> spec = UserSpecification.withFilters(login, email);
        return userRepository.findAll(spec, pageable).map(AdminUserDTO::new);
    }

    // NEW: auto-provisioning of an Employee record for every self-registered user.

    /**
     * Creates the Employee record automatically linked to a freshly registered User, using the
     * details captured on the registration form. Fields not collected at registration time
     * (job title, hire date, department) are given sensible defaults that an administrator
     * can update later from the Employee management screen.
     *
     * @param user    the newly persisted User (already has an id).
     * @param userDTO the registration payload, used to source firstName/lastName.
     * @param phone   the phone number captured on the registration form, may be null/blank.
     */
    private void createEmployeeForNewUser(User user, AdminUserDTO userDTO, String phone) {
        Employee employee = new Employee();
        employee.setUser(user);
        employee.setEmployeeNumber(generateNextEmployeeNumber());
        employee.setFirstName(resolveEmployeeFirstName(userDTO));
        employee.setLastName(resolveEmployeeLastName(userDTO));
        employee.setJobTitle(DEFAULT_EMPLOYEE_JOB_TITLE);
        employee.setHireDate(LocalDate.now());
        if (phone != null && !phone.isBlank()) {
            employee.setPhone(phone.trim());
        }
        // Department is intentionally left unassigned; an administrator assigns it later.
        employeeRepository.save(employee);
        LOG.debug("Created Employee for self-registered User: {}", employee);
    }

    /**
     * The registration form's firstName is optional (no @NotNull/minlength on the client),
     * but Employee.firstName requires at least 2 characters. Fall back to a value derived
     * from the login when the submitted firstName doesn't satisfy that constraint.
     */
    private String resolveEmployeeFirstName(AdminUserDTO userDTO) {
        String firstName = userDTO.getFirstName();
        if (firstName != null && firstName.trim().length() >= 2) {
            return firstName.trim();
        }
        return capitalizeForFallback(userDTO.getLogin());
    }

    /**
     * Same rationale as {@link #resolveEmployeeFirstName(AdminUserDTO)}, but lastName has no
     * natural source to derive from (the login already backs firstName), so a fixed
     * placeholder is used instead.
     */
    private String resolveEmployeeLastName(AdminUserDTO userDTO) {
        String lastName = userDTO.getLastName();
        if (lastName != null && lastName.trim().length() >= 2) {
            return lastName.trim();
        }
        return "N/A";
    }

    private static String capitalizeForFallback(String value) {
        if (value == null || value.isBlank()) {
            return "NA";
        }
        String trimmed = value.trim();
        if (trimmed.length() < 2) {
            // pad up to satisfy Employee's 2-character minimum
            trimmed = trimmed + "x";
        }
        String lower = trimmed.toLowerCase();
        return Character.toUpperCase(lower.charAt(0)) + lower.substring(1);
    }

    /**
     * Generates the next employee number in the format EMP-001, EMP-002, etc., matching the
     * same scheme used by the manual Employee creation form. The sequence is based on the
     * highest existing numeric suffix across all employees.
     */
    private String generateNextEmployeeNumber() {
        int nextSequence =
            employeeRepository
                .findAllEmployeeNumbers()
                .stream()
                .filter(Objects::nonNull)
                .map(EMPLOYEE_NUMBER_PATTERN::matcher)
                .filter(Matcher::matches)
                .mapToInt(matcher -> Integer.parseInt(matcher.group(1)))
                .max()
                .orElse(0) +
            1;
        return String.format("EMP-%04d", nextSequence);
    }
}
