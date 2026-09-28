package com.nexusdesk.ticket;

import com.nexusdesk.user.User;

import static com.nexusdesk.ticket.TicketDtos.*;

public final class TicketMapper {
    private TicketMapper() {}

    public static UserBrief user(User user) {
        return user == null ? null :
                new UserBrief(user.getId(), user.getName(), user.getRole());
    }

    public static CategoryResponse category(Category category) {
        return new CategoryResponse(category.getId(), category.getName(), category.getDescription());
    }

    public static TicketSummaryResponse summary(Ticket ticket) {
        return new TicketSummaryResponse(
                ticket.getId(),
                ticket.getCode(),
                ticket.getTitle(),
                ticket.getStatus(),
                ticket.getPriority(),
                category(ticket.getCategory()),
                user(ticket.getRequester()),
                user(ticket.getAssignee()),
                ticket.getCreatedAt(),
                ticket.getUpdatedAt());
    }

    public static CommentResponse comment(TicketComment comment) {
        return new CommentResponse(
                comment.getId(),
                user(comment.getAuthor()),
                comment.getBody(),
                comment.isInternal(),
                comment.getCreatedAt());
    }

    public static EventResponse event(TicketEvent event) {
        return new EventResponse(
                event.getId(),
                event.getType(),
                event.getDetails(),
                user(event.getActor()),
                event.getCreatedAt());
    }
}
