package com.samah.store.controller;

import com.samah.store.domain.entites.User;
import com.samah.store.domain.enums.Role;
import com.samah.store.dto.CreateEmployeeRequest;
import com.samah.store.dto.EmployeeInfoDto;
import com.samah.store.dto.AdminInfoDto;
import com.samah.store.exception.BadRequestException;
import com.samah.store.exception.ConflictException;
import com.samah.store.exception.NotFoundException;
import com.samah.store.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
public class AdminUsersController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUsersController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Create a new admin user (with ADMIN role)
     * POST /api/admin/users/admins
     */
    @PostMapping("/admins")
    @ResponseStatus(HttpStatus.CREATED)
    public AdminInfoDto createAdmin(@Valid @RequestBody CreateEmployeeRequest request) {
        // Check if username already exists
        if (userRepository.existsByUsername(request.username())) {
            throw new ConflictException("اسم المستخدم موجود مسبقاً");
        }
        // Check if email already exists
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("البريد الإلكتروني موجود مسبقاً");
        }

        User user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(Role.ADMIN);  // Create with ADMIN role
        user.setEnabled(true);
        user.setDeleted(false);
        user.setTokenVersion(0);

        User saved = userRepository.save(user);
        return new AdminInfoDto(saved.getId(), saved.getUsername(), saved.getEmail(), saved.getRole().name(), saved.isEnabled());
    }

    /**
     * DEPRECATED: Create employee (kept for backward compatibility)
     * Now effectively same as createAdmin but creates EMPLOYEE role
     * POST /api/admin/users/employees
     */
    @PostMapping("/employees")
    @ResponseStatus(HttpStatus.CREATED)
    public EmployeeInfoDto createEmployee(@Valid @RequestBody CreateEmployeeRequest request) {
        // Check if username already exists
        if (userRepository.existsByUsername(request.username())) {
            throw new ConflictException("اسم المستخدم موجود مسبقاً");
        }
        // Check if email already exists
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("البريد الإلكتروني موجود مسبقاً");
        }

        User user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(Role.EMPLOYEE);
        user.setEnabled(true);
        user.setDeleted(false);
        user.setTokenVersion(0);

        User saved = userRepository.save(user);
        return new EmployeeInfoDto(saved.getId(), saved.getUsername(), saved.getEmail(), saved.isEnabled());
    }

    @PatchMapping("/{id}/disable")
    public ResponseEntity<Void> disable(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("المستخدم غير موجود"));

        if (user.getRole() == Role.ADMIN) {
            throw new BadRequestException("لا يمكن تعطيل حساب المدير");
        }

        user.setEnabled(false);
        user.setTokenVersion(user.getTokenVersion() + 1); // يبطل كل التوكنات فوراً
        userRepository.save(user);

        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/enable")
    public ResponseEntity<Void> enable(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("المستخدم غير موجود"));

        user.setEnabled(true);
        userRepository.save(user);

        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/role")
    public EmployeeInfoDto updateRole(@PathVariable Long id, @RequestParam Role role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("المستخدم غير موجود"));

        if (user.getRole() == Role.ADMIN && role != Role.ADMIN) {
            throw new BadRequestException("لا يمكن تغيير دور المدير");
        }

        user.setRole(role);
        user.setTokenVersion(user.getTokenVersion() + 1); // إعادة تسجيل الدخول مطلوبة
        User saved = userRepository.save(user);

        return new EmployeeInfoDto(saved.getId(), saved.getUsername(), saved.getEmail(), saved.isEnabled());
    }
}
