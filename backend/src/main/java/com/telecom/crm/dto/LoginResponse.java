package com.telecom.crm.dto;

public record LoginResponse(
        String token,
        String username,
        String fullName,
        String role
) {
}
