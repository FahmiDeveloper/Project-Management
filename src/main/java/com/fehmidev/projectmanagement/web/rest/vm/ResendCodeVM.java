package com.fehmidev.projectmanagement.web.rest.vm;

import jakarta.validation.constraints.NotBlank;

public class ResendCodeVM {

    @NotBlank
    private String login;

    public String getLogin() {
        return login;
    }

    public void setLogin(String login) {
        this.login = login;
    }
}
