package com.telecom.crm.service;

import com.telecom.crm.dto.LoginRequest;
import com.telecom.crm.dto.LoginResponse;
import com.telecom.crm.dto.RegisterRequest;
import com.telecom.crm.dto.UserResponse;
import com.telecom.crm.dto.UserProfileResponse;
import com.telecom.crm.entity.Role;
import com.telecom.crm.entity.User;
import com.telecom.crm.exception.ConflictException;
import com.telecom.crm.exception.NotFoundException;
import com.telecom.crm.repository.RoleRepository;
import com.telecom.crm.repository.UserRepository;
import com.telecom.crm.security.AppUserDetails;
import com.telecom.crm.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserContextService userContextService;

    public AuthService(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            UserContextService userContextService
    ) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.userContextService = userContextService;
    }

    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );

        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new IllegalArgumentException("Identifiants invalides."));

        String token = jwtService.generateToken(new AppUserDetails(user), user.getFullName(), user.getRole().getName());

        return new LoginResponse(token, user.getUsername(), user.getFullName(), user.getRole().getName());
    }

    public UserProfileResponse me() {
        User user = userContextService.getCurrentUser();
        return new UserProfileResponse(user.getId(), user.getUsername(), user.getFullName(), user.getRole().getName());
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new ConflictException("Le nom d'utilisateur existe deja.");
        }

        Role role = roleRepository.findByName(request.role())
                .orElseThrow(() -> new NotFoundException("Role introuvable."));

        User user = User.builder()
                .username(request.username())
                .password(passwordEncoder.encode(request.password()))
                .fullName(request.fullName())
                .role(role)
                .enabled(request.enabled())
                .build();

        return toUserResponse(userRepository.save(user));
    }

    private UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getRole().getName(),
                user.isEnabled()
        );
    }
}
