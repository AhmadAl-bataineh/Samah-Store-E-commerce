package com.samah.store.controller;

import com.samah.store.domain.enums.Role;
import com.samah.store.dto.AssignOrderRequest;
import com.samah.store.dto.EmployeeInfoDto;
import com.samah.store.dto.AdminInfoDto;
import com.samah.store.dto.OrderDto;
import com.samah.store.repository.UserRepository;
import com.samah.store.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
public class AdminEmployeeController {

    private final UserRepository userRepository;
    private final OrderService orderService;

    public AdminEmployeeController(UserRepository userRepository, OrderService orderService) {
        this.userRepository = userRepository;
        this.orderService = orderService;
    }

    /**
     * List all admins (ADMIN + EMPLOYEE roles - they have same access now)
     * GET /api/admin/admins
     */
    @GetMapping("/admins")
    public List<AdminInfoDto> listAdmins() {
        // Combine ADMIN and EMPLOYEE users since they now have same access
        var admins = userRepository.findByRole(Role.ADMIN).stream()
                .map(u -> new AdminInfoDto(u.getId(), u.getUsername(), u.getEmail(), u.getRole().name(), u.isEnabled()));
        var employees = userRepository.findByRole(Role.EMPLOYEE).stream()
                .map(u -> new AdminInfoDto(u.getId(), u.getUsername(), u.getEmail(), u.getRole().name(), u.isEnabled()));

        return Stream.concat(admins, employees).toList();
    }

    /**
     * DEPRECATED: List employees only (kept for backward compatibility)
     * GET /api/admin/employees
     */
    @GetMapping("/employees")
    public List<EmployeeInfoDto> listEmployees() {
        return userRepository.findByRole(Role.EMPLOYEE).stream()
                .map(u -> new EmployeeInfoDto(u.getId(), u.getUsername(), u.getEmail(), u.isEnabled()))
                .toList();
    }

    @PatchMapping("/orders/{id}/assign")
    public OrderDto assignOrder(@PathVariable Long id, @Valid @RequestBody AssignOrderRequest request) {
        return orderService.assignEmployee(id, request.employeeId());
    }
}
