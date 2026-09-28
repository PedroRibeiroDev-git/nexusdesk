package com.nexusdesk.ticket;

import com.nexusdesk.user.User;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.Instant;

@Entity
@Table(name = "ticket_events")
public class TicketEvent {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id")
    private User actor;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private EventType type;
    @Column(nullable = false, length = 500)
    private String details;
    @Column(nullable = false)
    private boolean internal;
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public Long getId() { return id; }
    public Ticket getTicket() { return ticket; }
    public void setTicket(Ticket ticket) { this.ticket = ticket; }
    public User getActor() { return actor; }
    public void setActor(User actor) { this.actor = actor; }
    public EventType getType() { return type; }
    public void setType(EventType type) { this.type = type; }
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
    public boolean isInternal() { return internal; }
    public void setInternal(boolean internal) { this.internal = internal; }
    public Instant getCreatedAt() { return createdAt; }
}
