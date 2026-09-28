package com.nexusdesk.auth;

import com.nexusdesk.user.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public final class AuthDtos {
    private AuthDtos() {}

    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password
    ) {}

    public record UserResponse(Long id, String name, String email, Role role, boolean active) {}

    public record LoginResponse(String token, long expiresInSeconds, UserResponse user) {}
}
