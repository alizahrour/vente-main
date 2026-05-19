package com.telecom.crm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Size(max = 60) String username,
        @NotBlank @Size(min = 6) String password,
        @NotBlank @Size(max = 120) String fullName,
        @NotBlank String role,
        @NotNull Boolean enabled
) {
}
