package com.nexusdesk.dashboard;

import com.nexusdesk.ticket.TicketMapper;
import com.nexusdesk.ticket.TicketRepository;
import com.nexusdesk.ticket.TicketStatus;
import com.nexusdesk.user.Role;
import com.nexusdesk.user.User;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.nexusdesk.dashboard.DashboardDtos.DashboardResponse;

@Service
public class DashboardService {
    private final TicketRepository ticketRepository;

    public DashboardService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    @Transactional(readOnly = true)
    public DashboardResponse dashboard(User user) {
        boolean client = user.getRole() == Role.CLIENT;
        Long requesterId = client ? user.getId() : null;

        long open = count(requesterId, TicketStatus.OPEN);
        long inProgress = count(requesterId, TicketStatus.IN_PROGRESS);
        long waiting = count(requesterId, TicketStatus.WAITING_CUSTOMER);
        long resolved = count(requesterId, TicketStatus.RESOLVED);
        long closed = count(requesterId, TicketStatus.CLOSED);
        long unassigned = client ? 0 :
                ticketRepository.countByAssigneeIsNullAndStatusNot(TicketStatus.CLOSED);

        var recent = ticketRepository.search(
                        requesterId, null, null, null, null, false, null,
                        PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "updatedAt")))
                .map(TicketMapper::summary)
                .getContent();

        return new DashboardResponse(
                open, inProgress, waiting, resolved, closed, unassigned, recent);
    }

    private long count(Long requesterId, TicketStatus status) {
        return requesterId == null
                ? ticketRepository.countByStatus(status)
                : ticketRepository.countByRequesterIdAndStatus(requesterId, status);
    }
}
