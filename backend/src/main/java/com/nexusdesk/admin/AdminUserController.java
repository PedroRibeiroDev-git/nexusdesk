package com.nexusdesk.admin;

import com.nexusdesk.security.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.nexusdesk.admin.AdminDtos.*;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {
    private final AdminUserService service;
    private final CurrentUserService currentUserService;

    public AdminUserController(
            AdminUserService service,
            CurrentUserService currentUserService) {
        this.service = service;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public List<AdminUserResponse> list(Authentication auth) {
        return service.list(currentUserService.require(auth));
    }

    @PostMapping
    public AdminUserResponse create(
            Authentication auth,
            @Valid @RequestBody CreateUserRequest request) {
        return service.create(currentUserService.require(auth), request);
    }

    @PatchMapping("/{id}")
    public AdminUserResponse update(
            Authentication auth,
            @PathVariable Long id,
            @RequestBody UpdateUserRequest request) {
        return service.update(currentUserService.require(auth), id, request);
    }
}
