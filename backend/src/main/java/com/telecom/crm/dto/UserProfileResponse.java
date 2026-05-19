package com.telecom.crm.dto;

public record UserProfileResponse(
        Long id,
        String username,
        String fullName,
        String role
) {
}
