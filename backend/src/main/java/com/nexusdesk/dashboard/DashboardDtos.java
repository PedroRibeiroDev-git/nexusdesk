package com.nexusdesk.dashboard;

import com.nexusdesk.ticket.TicketDtos.TicketSummaryResponse;
import java.util.List;

public final class DashboardDtos {
    private DashboardDtos() {}

    public record DashboardResponse(
            long open,
            long inProgress,
            long waitingCustomer,
            long resolved,
            long closed,
            long unassigned,
            List<TicketSummaryResponse> recentTickets
    ) {}
}
