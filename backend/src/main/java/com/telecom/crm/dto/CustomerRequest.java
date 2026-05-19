package com.telecom.crm.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CustomerRequest(
        @NotBlank @Size(max = 80) String firstName,
        @NotBlank @Size(max = 80) String lastName,
        @NotBlank @Size(max = 30) String cin,
        @NotBlank @Size(max = 25) String phone,
        @Email @Size(max = 120) String email,
        @Size(max = 255) String address,
        @Size(max = 80) String city
) {
}
