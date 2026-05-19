package com.telecom.crm.dto;

public record UserResponse(
        Long id,
        String username,
        String fullName,
        String role,
        boolean enabled
) {
}
