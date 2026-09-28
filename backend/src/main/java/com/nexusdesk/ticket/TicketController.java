package com.nexusdesk.ticket;

import com.nexusdesk.security.CurrentUserService;
import com.nexusdesk.user.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

import static com.nexusdesk.ticket.TicketDtos.*;

@RestController
@RequestMapping("/api")
public class TicketController {
    private final TicketService ticketService;
    private final CurrentUserService currentUserService;

    public TicketController(
            TicketService ticketService,
            CurrentUserService currentUserService) {
        this.ticketService = ticketService;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/categories")
    public List<CategoryResponse> categories() {
        return ticketService.categories();
    }

    @GetMapping("/agents")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public List<UserBrief> agents(Authentication auth) {
        return ticketService.agents(currentUserService.require(auth));
    }

    @GetMapping("/tickets")
    public PageResponse<TicketSummaryResponse> list(
            Authentication auth,
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long assigneeId,
            @RequestParam(defaultValue = "false") boolean unassigned,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        User current = currentUserService.require(auth);
        return ticketService.list(
                current, status, priority, categoryId,
                assigneeId, unassigned, search, page, size);
    }

    @PostMapping("/tickets")
    public ResponseEntity<TicketDetailResponse> create(
            Authentication auth,
            @Valid @RequestBody CreateTicketRequest request) {

        User current = currentUserService.require(auth);
        TicketDetailResponse created = ticketService.create(current, request);
        return ResponseEntity
                .created(URI.create("/api/tickets/" + created.id()))
                .body(created);
    }

    @GetMapping("/tickets/{id}")
    public TicketDetailResponse detail(Authentication auth, @PathVariable Long id) {
        return ticketService.detail(currentUserService.require(auth), id);
    }

    @PatchMapping("/tickets/{id}")
    public TicketDetailResponse update(
            Authentication auth,
            @PathVariable Long id,
            @RequestBody UpdateTicketRequest request) {
        return ticketService.update(currentUserService.require(auth), id, request);
    }

    @PostMapping("/tickets/{id}/assign-to-me")
    public TicketDetailResponse assignToMe(
            Authentication auth,
            @PathVariable Long id) {
        return ticketService.assignToMe(currentUserService.require(auth), id);
    }

    @PostMapping("/tickets/{id}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public TicketDetailResponse comment(
            Authentication auth,
            @PathVariable Long id,
            @Valid @RequestBody AddCommentRequest request) {
        return ticketService.addComment(currentUserService.require(auth), id, request);
    }
}
