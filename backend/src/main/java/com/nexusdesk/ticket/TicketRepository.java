package com.nexusdesk.ticket;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    @Override
    @EntityGraph(attributePaths = {"requester", "assignee", "category"})
    Optional<Ticket> findById(Long id);

    @EntityGraph(attributePaths = {"requester", "assignee", "category"})
    @Query("""
        select t from Ticket t
        where (:requesterId is null or t.requester.id = :requesterId)
          and (:status is null or t.status = :status)
          and (:priority is null or t.priority = :priority)
          and (:categoryId is null or t.category.id = :categoryId)
          and (:assigneeId is null or t.assignee.id = :assigneeId)
          and (:unassigned = false or t.assignee is null)
          and (lower(t.code) like lower(concat('%', :search, '%'))
               or lower(t.title) like lower(concat('%', :search, '%'))
               or :search is null)
        """)
    Page<Ticket> search(
            @Param("requesterId") Long requesterId,
            @Param("status") TicketStatus status,
            @Param("priority") Priority priority,
            @Param("categoryId") Long categoryId,
            @Param("assigneeId") Long assigneeId,
            @Param("unassigned") boolean unassigned,
            @Param("search") String search,
            Pageable pageable);

    long countByStatus(TicketStatus status);
    long countByRequesterIdAndStatus(Long requesterId, TicketStatus status);
    long countByAssigneeIsNullAndStatusNot(TicketStatus status);
}
