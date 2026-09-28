package com.nexusdesk.security;

import com.nexusdesk.common.ForbiddenException;
import com.nexusdesk.user.User;
import com.nexusdesk.user.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {
    private final UserRepository userRepository;

    public CurrentUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User require(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ForbiddenException("Sessão inválida ou usuário sem acesso.");
        }
        return userRepository.findByEmailIgnoreCase(authentication.getName())
                .filter(User::isActive)
                .orElseThrow(() -> new ForbiddenException("Usuário autenticado não encontrado ou inativo."));
    }
}
