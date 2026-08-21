package com.fehmidev.projectmanagement.web.rest.vm;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class VerifyCodeVM {

    @NotBlank
    private String login;

    @NotBlank
    @Pattern(regexp = "^[0-9]{6}$")
    private String code;

    public String getLogin() {
        return login;
    }

    public void setLogin(String login) {
        this.login = login;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}
