package com.nexusdesk.admin;

import com.nexusdesk.user.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;

public final class AdminDtos {
    private AdminDtos() {}

    public record AdminUserResponse(
            Long id, String name, String email, Role role,
            boolean active, Instant createdAt) {}

    public record CreateUserRequest(
            @NotBlank @Size(min = 3, max = 120) String name,
            @NotBlank @Email String email,
            @NotBlank @Size(min = 8, max = 100) String password,
            @NotNull Role role
    ) {}

    public record UpdateUserRequest(Role role, Boolean active) {}
}
