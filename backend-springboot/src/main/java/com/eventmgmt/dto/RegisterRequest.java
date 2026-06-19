package com.eventmgmt.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String role; // ROLE_STUDENT, ROLE_ORGANIZATION, ROLE_FACULTY, ROLE_ADMIN
    private String organizationName;
    private String department;
}
