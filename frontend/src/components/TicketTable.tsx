import { Link } from 'react-router-dom'
import { dateTime } from '../lib/format'
import type { TicketSummary } from '../types'
import { PriorityBadge, StatusBadge } from './Badge'
import { EmptyState } from './EmptyState'

export function TicketTable({ tickets }: { tickets: TicketSummary[] }) {
  if (tickets.length === 0) {
    return (
      <EmptyState
        title="Nenhum chamado encontrado"
        text="Tente ajustar os filtros ou abra um novo chamado."
      />
    )
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Chamado</th>
            <th>Status</th>
            <th>Prioridade</th>
            <th>Categoria</th>
            <th>Responsável</th>
            <th>Atualizado</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td>
                <Link className="ticket-link" to={`/tickets/${ticket.id}`}>
                  <span>{ticket.code}</span>
                  <strong>{ticket.title}</strong>
                </Link>
              </td>
              <td><StatusBadge value={ticket.status} /></td>
              <td><PriorityBadge value={ticket.priority} /></td>
              <td>{ticket.category.name}</td>
              <td>
                {ticket.assignee?.name ?? (
                  <span className="muted">Não atribuído</span>
                )}
              </td>
              <td>{dateTime(ticket.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
