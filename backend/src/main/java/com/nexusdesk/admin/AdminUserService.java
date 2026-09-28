package com.nexusdesk.admin;

import com.nexusdesk.common.BusinessException;
import com.nexusdesk.common.ForbiddenException;
import com.nexusdesk.common.NotFoundException;
import com.nexusdesk.user.Role;
import com.nexusdesk.user.User;
import com.nexusdesk.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static com.nexusdesk.admin.AdminDtos.*;

@Service
public class AdminUserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<AdminUserResponse> list(User current) {
        requireAdmin(current);
        return userRepository.findAll().stream()
                .sorted((a, b) -> a.getName().compareToIgnoreCase(b.getName()))
                .map(this::map)
                .toList();
    }

    @Transactional
    public AdminUserResponse create(User current, CreateUserRequest request) {
        requireAdmin(current);
        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new BusinessException("Já existe um usuário com este e-mail.");
        }

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(request.role());
        user.setActive(true);

        return map(userRepository.save(user));
    }

    @Transactional
    public AdminUserResponse update(
            User current, Long id, UpdateUserRequest request) {

        requireAdmin(current);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado."));

        if (request.active() != null) {
            if (user.getId().equals(current.getId()) && !request.active()) {
                throw new BusinessException("Você não pode desativar sua própria conta.");
            }
            user.setActive(request.active());
        }

        if (request.role() != null) {
            if (user.getId().equals(current.getId()) &&
                    request.role() != current.getRole()) {
                throw new BusinessException(
                        "Altere o perfil de outro administrador, não o da sessão atual.");
            }
            user.setRole(request.role());
        }

        return map(user);
    }

    private void requireAdmin(User current) {
        if (current.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Ação disponível apenas para administradores.");
        }
    }

    private AdminUserResponse map(User user) {
        return new AdminUserResponse(
                user.getId(), user.getName(), user.getEmail(),
                user.getRole(), user.isActive(), user.getCreatedAt());
    }
}
