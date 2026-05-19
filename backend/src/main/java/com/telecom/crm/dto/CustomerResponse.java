package com.telecom.crm.dto;

public record CustomerResponse(
        Long id,
        String firstName,
        String lastName,
        String fullName,
        String cin,
        String phone,
        String email,
        String address,
        String city
) {
}
