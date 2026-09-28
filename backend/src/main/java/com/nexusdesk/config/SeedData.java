package com.nexusdesk.config;

import com.nexusdesk.ticket.*;
import com.nexusdesk.user.Role;
import com.nexusdesk.user.User;
import com.nexusdesk.user.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Configuration
@ConditionalOnProperty(name = "app.seed-demo", havingValue = "true")
public class SeedData {
    @Bean
    CommandLineRunner seed(
            UserRepository users,
            CategoryRepository categories,
            TicketRepository tickets,
            TicketCommentRepository comments,
            TicketEventRepository events,
            PasswordEncoder encoder) {

        return args -> {
            if (categories.count() == 0) {
                createCategory(categories, "Acesso e Conta",
                        "Login, permissões, senhas e autenticação.");
                createCategory(categories, "Hardware",
                        "Computadores, periféricos e equipamentos.");
                createCategory(categories, "Software",
                        "Aplicações, instalação e erros de sistema.");
                createCategory(categories, "Rede e Conectividade",
                        "Internet, Wi-Fi, VPN e serviços de rede.");
                createCategory(categories, "Solicitação",
                        "Pedidos gerais de serviço e suporte.");
            }

            if (users.count() == 0) {
                User admin = createUser(
                        users, encoder, "Administrador Demo",
                        "admin@nexusdesk.dev", "Admin@123", Role.ADMIN);
                User agent = createUser(
                        users, encoder, "Marina Costa",
                        "agent@nexusdesk.dev", "Agent@123", Role.AGENT);
                User client = createUser(
                        users, encoder, "Cliente Demo",
                        "client@nexusdesk.dev", "Client@123", Role.CLIENT);

                List<Category> all = categories.findByActiveTrueOrderByNameAsc();

                Ticket t1 = createTicket(
                        tickets, client, agent, find(all, "Software"),
                        Priority.HIGH, TicketStatus.IN_PROGRESS,
                        "Erro ao abrir sistema financeiro",
                        "Ao iniciar o sistema financeiro, a aplicação exibe uma mensagem de falha de conexão e encerra.");
                addEvent(events, t1, client, EventType.CREATED, "Chamado criado.");
                addEvent(events, t1, agent, EventType.ASSIGNEE_CHANGED,
                        "Chamado atribuído a Marina Costa.");
                addComment(comments, t1, agent,
                        "Recebi o chamado e estou validando os logs do serviço.", false);
                addComment(comments, t1, agent,
                        "Possível indisponibilidade da integração. Acompanhar antes de escalar.", true);

                Ticket t2 = createTicket(
                        tickets, client, null, find(all, "Rede e Conectividade"),
                        Priority.MEDIUM, TicketStatus.OPEN,
                        "Wi-Fi instável na sala de reunião",
                        "A conexão cai algumas vezes durante chamadas de vídeo na sala de reunião principal.");
                addEvent(events, t2, client, EventType.CREATED, "Chamado criado.");

                Ticket t3 = createTicket(
                        tickets, client, admin, find(all, "Acesso e Conta"),
                        Priority.LOW, TicketStatus.RESOLVED,
                        "Redefinição de acesso ao portal interno",
                        "Preciso recuperar o acesso ao portal interno após a troca do computador.");
                t3.setResolvedAt(Instant.now());
                tickets.save(t3);
                addEvent(events, t3, client, EventType.CREATED, "Chamado criado.");
                addEvent(events, t3, admin, EventType.STATUS_CHANGED,
                        "Status alterado para RESOLVED.");
                addComment(comments, t3, admin,
                        "Acesso redefinido e validado com sucesso.", false);
            }
        };
    }

    private static void createCategory(
            CategoryRepository repo, String name, String description) {
        Category category = new Category();
        category.setName(name);
        category.setDescription(description);
        category.setActive(true);
        repo.save(category);
    }

    private static User createUser(
            UserRepository repo, PasswordEncoder encoder,
            String name, String email, String password, Role role) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPasswordHash(encoder.encode(password));
        user.setRole(role);
        user.setActive(true);
        return repo.save(user);
    }

    private static Category find(List<Category> categories, String name) {
        return categories.stream()
                .filter(c -> c.getName().equals(name))
                .findFirst()
                .orElseThrow();
    }

    private static Ticket createTicket(
            TicketRepository repo, User requester, User assignee,
            Category category, Priority priority, TicketStatus status,
            String title, String description) {

        Ticket ticket = new Ticket();
        int year = Instant.now().atZone(ZoneOffset.UTC).getYear();
        ticket.setCode("ND-" + year + "-" +
                UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT));
        ticket.setRequester(requester);
        ticket.setAssignee(assignee);
        ticket.setCategory(category);
        ticket.setPriority(priority);
        ticket.setStatus(status);
        ticket.setTitle(title);
        ticket.setDescription(description);
        return repo.save(ticket);
    }

    private static void addComment(
            TicketCommentRepository repo, Ticket ticket, User author,
            String body, boolean internal) {
        TicketComment comment = new TicketComment();
        comment.setTicket(ticket);
        comment.setAuthor(author);
        comment.setBody(body);
        comment.setInternal(internal);
        repo.save(comment);
    }

    private static void addEvent(
            TicketEventRepository repo, Ticket ticket, User actor,
            EventType type, String details) {
        TicketEvent event = new TicketEvent();
        event.setTicket(ticket);
        event.setActor(actor);
        event.setType(type);
        event.setDetails(details);
        event.setInternal(false);
        repo.save(event);
    }
}
