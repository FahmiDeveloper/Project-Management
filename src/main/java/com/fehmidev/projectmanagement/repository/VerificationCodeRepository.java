package com.fehmidev.projectmanagement.repository;

import com.fehmidev.projectmanagement.domain.User;
import com.fehmidev.projectmanagement.domain.VerificationCode;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VerificationCodeRepository extends JpaRepository<VerificationCode, Long> {
    Optional<VerificationCode> findFirstByUserAndCodeAndUsedIsFalseOrderByCreatedDateDesc(User user, String code);

    List<VerificationCode> findAllByUserAndUsedIsFalse(User user);
}
