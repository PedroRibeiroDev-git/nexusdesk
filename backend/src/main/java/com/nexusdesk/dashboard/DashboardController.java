package com.nexusdesk.dashboard;

import com.nexusdesk.security.CurrentUserService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import static com.nexusdesk.dashboard.DashboardDtos.DashboardResponse;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final DashboardService dashboardService;
    private final CurrentUserService currentUserService;

    public DashboardController(
            DashboardService dashboardService,
            CurrentUserService currentUserService) {
        this.dashboardService = dashboardService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public DashboardResponse dashboard(Authentication auth) {
        return dashboardService.dashboard(currentUserService.require(auth));
    }
}
