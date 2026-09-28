package com.nexusdesk.ticket;

import com.nexusdesk.user.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;

public final class TicketDtos {
    private TicketDtos() {}

    public record UserBrief(Long id, String name, Role role) {}
    public record CategoryResponse(Long id, String name, String description) {}

    public record CreateTicketRequest(
            @NotBlank @Size(min = 5, max = 160) String title,
            @NotBlank @Size(min = 10, max = 5000) String description,
            @NotNull Priority priority,
            @NotNull Long categoryId
    ) {}

    public record UpdateTicketRequest(
            TicketStatus status,
            Priority priority,
            Long categoryId,
            Long assigneeId
    ) {}

    public record AddCommentRequest(
            @NotBlank @Size(min = 2, max = 4000) String body,
            boolean internal
    ) {}

    public record TicketSummaryResponse(
            Long id,
            String code,
            String title,
            TicketStatus status,
            Priority priority,
            CategoryResponse category,
            UserBrief requester,
            UserBrief assignee,
            Instant createdAt,
            Instant updatedAt
    ) {}

    public record CommentResponse(
            Long id,
            UserBrief author,
            String body,
            boolean internal,
            Instant createdAt
    ) {}

    public record EventResponse(
            Long id,
            EventType type,
            String details,
            UserBrief actor,
            Instant createdAt
    ) {}

    public record TicketDetailResponse(
            Long id,
            String code,
            String title,
            String description,
            TicketStatus status,
            Priority priority,
            CategoryResponse category,
            UserBrief requester,
            UserBrief assignee,
            Instant createdAt,
            Instant updatedAt,
            Instant resolvedAt,
            Long version,
            List<CommentResponse> comments,
            List<EventResponse> events
    ) {}

    public record PageResponse<T>(
            List<T> content,
            int page,
            int size,
            long totalElements,
            int totalPages
    ) {}
}
