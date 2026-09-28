package com.nexusdesk.ticket;

import com.nexusdesk.common.BusinessException;
import com.nexusdesk.common.ForbiddenException;
import com.nexusdesk.common.NotFoundException;
import com.nexusdesk.user.Role;
import com.nexusdesk.user.User;
import com.nexusdesk.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import static com.nexusdesk.ticket.TicketDtos.*;
import static com.nexusdesk.ticket.TicketMapper.*;

@Service
public class TicketService {
    private final TicketRepository ticketRepository;
    private final CategoryRepository categoryRepository;
    private final TicketCommentRepository commentRepository;
    private final TicketEventRepository eventRepository;
    private final UserRepository userRepository;

    public TicketService(
            TicketRepository ticketRepository,
            CategoryRepository categoryRepository,
            TicketCommentRepository commentRepository,
            TicketEventRepository eventRepository,
            UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.categoryRepository = categoryRepository;
        this.commentRepository = commentRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public TicketDetailResponse create(User current, CreateTicketRequest request) {
        Category category = activeCategory(request.categoryId());
        Ticket ticket = new Ticket();
        ticket.setCode(generateCode());
        ticket.setTitle(request.title().trim());
        ticket.setDescription(request.description().trim());
        ticket.setPriority(request.priority());
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCategory(category);
        ticket.setRequester(current);
        ticketRepository.save(ticket);
        addEvent(ticket, current, EventType.CREATED, "Chamado criado.");
        return detail(current, ticket.getId());
    }

    @Transactional(readOnly = true)
    public PageResponse<TicketSummaryResponse> list(
            User current,
            TicketStatus status,
            Priority priority,
            Long categoryId,
            Long assigneeId,
            boolean unassigned,
            String search,
            int page,
            int size) {

        int safeSize = Math.min(Math.max(size, 1), 50);
        int safePage = Math.max(page, 0);
        Long requesterId = current.getRole() == Role.CLIENT ? current.getId() : null;

        if (current.getRole() == Role.CLIENT) {
            assigneeId = null;
            unassigned = false;
        }

        String normalizedSearch = search == null || search.isBlank() ? null : search.trim();
        Pageable pageable = PageRequest.of(
                safePage, safeSize, Sort.by(Sort.Direction.DESC, "updatedAt"));

        Page<Ticket> result = ticketRepository.search(
                requesterId, status, priority, categoryId,
                assigneeId, unassigned, normalizedSearch, pageable);

        return new PageResponse<>(
                result.map(TicketMapper::summary).getContent(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages());
    }

    @Transactional(readOnly = true)
    public TicketDetailResponse detail(User current, Long id) {
        Ticket ticket = findTicket(id);
        ensureCanView(current, ticket);

        List<CommentResponse> comments = commentRepository.findByTicketIdOrderByCreatedAtAsc(id)
                .stream()
                .filter(c -> current.getRole() != Role.CLIENT || !c.isInternal())
                .map(TicketMapper::comment)
                .toList();

        List<EventResponse> events = eventRepository.findByTicketIdOrderByCreatedAtDesc(id)
                .stream()
                .filter(e -> current.getRole() != Role.CLIENT || !e.isInternal())
                .map(TicketMapper::event)
                .toList();

        return new TicketDetailResponse(
                ticket.getId(),
                ticket.getCode(),
                ticket.getTitle(),
                ticket.getDescription(),
                ticket.getStatus(),
                ticket.getPriority(),
                category(ticket.getCategory()),
                user(ticket.getRequester()),
                user(ticket.getAssignee()),
                ticket.getCreatedAt(),
                ticket.getUpdatedAt(),
                ticket.getResolvedAt(),
                ticket.getVersion(),
                comments,
                events);
    }

    @Transactional
    public TicketDetailResponse update(User current, Long id, UpdateTicketRequest request) {
        requireStaff(current);
        Ticket ticket = findTicket(id);

        if (request.status() != null && request.status() != ticket.getStatus()) {
            TicketStatus old = ticket.getStatus();
            ticket.setStatus(request.status());

            if (request.status() == TicketStatus.RESOLVED || request.status() == TicketStatus.CLOSED) {
                ticket.setResolvedAt(Instant.now());
            } else if (old == TicketStatus.RESOLVED || old == TicketStatus.CLOSED) {
                ticket.setResolvedAt(null);
            }

            addEvent(ticket, current, EventType.STATUS_CHANGED,
                    "Status alterado de " + old + " para " + request.status() + ".");
        }

        if (request.priority() != null && request.priority() != ticket.getPriority()) {
            Priority old = ticket.getPriority();
            ticket.setPriority(request.priority());
            addEvent(ticket, current, EventType.PRIORITY_CHANGED,
                    "Prioridade alterada de " + old + " para " + request.priority() + ".");
        }

        if (request.categoryId() != null &&
                !request.categoryId().equals(ticket.getCategory().getId())) {
            String old = ticket.getCategory().getName();
            Category category = activeCategory(request.categoryId());
            ticket.setCategory(category);
            addEvent(ticket, current, EventType.CATEGORY_CHANGED,
                    "Categoria alterada de " + old + " para " + category.getName() + ".");
        }

        if (request.assigneeId() != null) {
            User assignee = userRepository.findById(request.assigneeId())
                    .filter(User::isActive)
                    .orElseThrow(() -> new NotFoundException("Responsável não encontrado."));

            if (assignee.getRole() == Role.CLIENT) {
                throw new BusinessException("Um cliente não pode ser responsável por chamados.");
            }

            if (ticket.getAssignee() == null ||
                    !assignee.getId().equals(ticket.getAssignee().getId())) {
                ticket.setAssignee(assignee);
                addEvent(ticket, current, EventType.ASSIGNEE_CHANGED,
                        "Chamado atribuído a " + assignee.getName() + ".");
            }
        }

        ticketRepository.save(ticket);
        return detail(current, id);
    }

    @Transactional
    public TicketDetailResponse assignToMe(User current, Long id) {
        requireStaff(current);
        Ticket ticket = findTicket(id);

        if (ticket.getAssignee() == null ||
                !ticket.getAssignee().getId().equals(current.getId())) {
            ticket.setAssignee(current);

            if (ticket.getStatus() == TicketStatus.OPEN) {
                ticket.setStatus(TicketStatus.IN_PROGRESS);
                addEvent(ticket, current, EventType.STATUS_CHANGED,
                        "Status alterado de OPEN para IN_PROGRESS.");
            }

            addEvent(ticket, current, EventType.ASSIGNEE_CHANGED,
                    "Chamado assumido por " + current.getName() + ".");
        }

        return detail(current, id);
    }

    @Transactional
    public TicketDetailResponse addComment(User current, Long id, AddCommentRequest request) {
        Ticket ticket = findTicket(id);
        ensureCanView(current, ticket);

        if (current.getRole() == Role.CLIENT && request.internal()) {
            throw new ForbiddenException("Clientes não podem criar comentários internos.");
        }

        TicketComment comment = new TicketComment();
        comment.setTicket(ticket);
        comment.setAuthor(current);
        comment.setBody(request.body().trim());
        comment.setInternal(request.internal());
        commentRepository.save(comment);

        addEvent(ticket, current, EventType.COMMENT_ADDED,
                request.internal() ? "Nota interna adicionada." : "Comentário adicionado.",
                request.internal());

        return detail(current, id);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> categories() {
        return categoryRepository.findByActiveTrueOrderByNameAsc()
                .stream().map(TicketMapper::category).toList();
    }

    @Transactional(readOnly = true)
    public List<UserBrief> agents(User current) {
        requireStaff(current);
        return userRepository.findByRoleInAndActiveTrueOrderByNameAsc(
                        List.of(Role.AGENT, Role.ADMIN))
                .stream().map(TicketMapper::user).toList();
    }

    private Ticket findTicket(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Chamado não encontrado."));
    }

    private Category activeCategory(Long id) {
        return categoryRepository.findById(id)
                .filter(Category::isActive)
                .orElseThrow(() -> new NotFoundException("Categoria não encontrada."));
    }

    private void ensureCanView(User current, Ticket ticket) {
        if (current.getRole() == Role.CLIENT &&
                !ticket.getRequester().getId().equals(current.getId())) {
            throw new ForbiddenException("Você não possui acesso a este chamado.");
        }
    }

    private void requireStaff(User current) {
        if (current.getRole() == Role.CLIENT) {
            throw new ForbiddenException(
                    "Ação disponível apenas para agentes e administradores.");
        }
    }

    private void addEvent(Ticket ticket, User actor, EventType type, String details) {
        addEvent(ticket, actor, type, details, false);
    }

    private void addEvent(Ticket ticket, User actor, EventType type, String details, boolean internal) {
        TicketEvent event = new TicketEvent();
        event.setTicket(ticket);
        event.setActor(actor);
        event.setType(type);
        event.setDetails(details);
        event.setInternal(internal);
        eventRepository.save(event);
    }

    private String generateCode() {
        int year = Instant.now().atZone(ZoneOffset.UTC).getYear();
        return "ND-" + year + "-" +
                UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
    }
}
