package com.fehmidev.projectmanagement.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.io.Serializable;
import java.time.Instant;

/**
 * A 6-digit email verification code issued at registration time, replacing the previous
 * activation-link flow. Kept as a plain entity (no AbstractAuditingEntity), matching the
 * majority pattern of your other custom entities rather than User. Relies on the shared
 * "sequenceGenerator" already used for entities like Employee (no per-entity sequence declared,
 * same as Employee's changelog) — flag it if your project actually gives each entity its own
 * sequence, since I inferred this from Employee's changelog not creating one.
 */
@Entity
@Table(name = "verification_code")
public class VerificationCode implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    private Long id;

    @NotNull
    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private User user;

    @NotNull
    @Size(min = 6, max = 6)
    @Column(name = "code", length = 6, nullable = false)
    private String code;

    @NotNull
    @Column(name = "expiry_date", nullable = false)
    private Instant expiryDate;

    @NotNull
    @Column(name = "used", nullable = false)
    private boolean used = false;

    @NotNull
    @Column(name = "created_date", nullable = false, updatable = false)
    private Instant createdDate = Instant.now();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public Instant getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(Instant expiryDate) {
        this.expiryDate = expiryDate;
    }

    public boolean isUsed() {
        return used;
    }

    public void setUsed(boolean used) {
        this.used = used;
    }

    public Instant getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Instant createdDate) {
        this.createdDate = createdDate;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof VerificationCode)) {
            return false;
        }
        return id != null && id.equals(((VerificationCode) o).id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "VerificationCode{" + "id=" + id + ", expiryDate=" + expiryDate + ", used=" + used + '}';
    }
}
