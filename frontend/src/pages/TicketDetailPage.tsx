import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PriorityBadge, StatusBadge } from '../components/Badge'
import { Spinner } from '../components/Spinner'
import { useAuth } from '../context/AuthContext'
import { api, ApiError } from '../lib/api'
import { dateTime, priorityLabel, statusLabel } from '../lib/format'
import type {
  Category,
  Priority,
  TicketDetail,
  TicketStatus,
  UserBrief,
} from '../types'

export function TicketDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [ticket, setTicket] = useState<TicketDetail | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [agents, setAgents] = useState<UserBrief[]>([])
  const [comment, setComment] = useState('')
  const [internal, setInternal] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const staff = user?.role !== 'CLIENT'

  const load = useCallback(async () => {
    if (!id) return

    try {
      setTicket(await api<TicketDetail>(`/tickets/${id}`))
      setError('')
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Falha ao carregar chamado.',
      )
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!staff) return
    void api<Category[]>('/categories').then(setCategories)
    void api<UserBrief[]>('/agents').then(setAgents)
  }, [staff])

  async function patch(payload: Record<string, unknown>) {
    if (!id) return
    setSaving(true)

    try {
      setTicket(
        await api<TicketDetail>(`/tickets/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        }),
      )
      setError('')
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Falha ao atualizar chamado.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function addComment(event: FormEvent) {
    event.preventDefault()
    if (!id || !comment.trim()) return

    setSaving(true)

    try {
      setTicket(
        await api<TicketDetail>(`/tickets/${id}/comments`, {
          method: 'POST',
          body: JSON.stringify({ body: comment, internal }),
        }),
      )
      setComment('')
      setInternal(false)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha ao comentar.')
    } finally {
      setSaving(false)
    }
  }

  async function assignToMe() {
    if (!id) return
    setSaving(true)

    try {
      setTicket(
        await api<TicketDetail>(`/tickets/${id}/assign-to-me`, {
          method: 'POST',
        }),
      )
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Falha ao assumir chamado.',
      )
    } finally {
      setSaving(false)
    }
  }

  if (!ticket && !error) return <Spinner full />

  if (!ticket) {
    return (
      <div className="page">
        <div className="alert error">{error}</div>
        <Link to="/tickets">← Voltar</Link>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="breadcrumbs">
        <Link to="/tickets">Chamados</Link>
        <span>/</span>
        <span>{ticket.code}</span>
      </div>

      <div className="ticket-detail-head">
        <div>
          <div className="ticket-kicker">
            <span>{ticket.code}</span>
            <StatusBadge value={ticket.status} />
            <PriorityBadge value={ticket.priority} />
          </div>
          <h1>{ticket.title}</h1>
          <p>
            Aberto por {ticket.requester.name} em {dateTime(ticket.createdAt)}
          </p>
        </div>

        {staff && !ticket.assignee && (
          <button
            className="button primary"
            onClick={assignToMe}
            disabled={saving}
          >
            Assumir chamado
          </button>
        )}
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="detail-grid">
        <div className="detail-main">
          <section className="panel">
            <h2>Descrição</h2>
            <p className="description-text">{ticket.description}</p>
          </section>

          <section className="panel">
            <div className="panel-head">
              <div>
                <h2>Conversa</h2>
                <p>
                  {ticket.comments.length} interação
                  {ticket.comments.length === 1 ? '' : 'ões'}
                </p>
              </div>
            </div>

            <div className="comments">
              {ticket.comments.length === 0 && (
                <p className="muted">Ainda não há comentários.</p>
              )}

              {ticket.comments.map((entry) => (
                <article
                  className={`comment ${entry.internal ? 'internal' : ''}`}
                  key={entry.id}
                >
                  <div className="avatar small">
                    {entry.author.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <header>
                      <strong>{entry.author.name}</strong>
                      {entry.internal && (
                        <span className="internal-tag">Nota interna</span>
                      )}
                      <time>{dateTime(entry.createdAt)}</time>
                    </header>
                    <p>{entry.body}</p>
                  </div>
                </article>
              ))}
            </div>

            <form className="comment-form" onSubmit={addComment}>
              <textarea
                rows={4}
                placeholder="Escreva uma resposta..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />

              {staff && (
                <label className="check">
                  <input
                    type="checkbox"
                    checked={internal}
                    onChange={(e) => setInternal(e.target.checked)}
                  />
                  Nota interna (visível apenas para a equipe)
                </label>
              )}

              <div>
                <button className="button primary" disabled={saving}>
                  Enviar comentário
                </button>
              </div>
            </form>
          </section>

          <section className="panel">
            <div className="panel-head">
              <div>
                <h2>Histórico</h2>
                <p>Trilha de auditoria do chamado.</p>
              </div>
            </div>

            <div className="timeline">
              {ticket.events.map((event) => (
                <div className="timeline-item" key={event.id}>
                  <span className="timeline-dot" />
                  <div>
                    <strong>{event.details}</strong>
                    <p>
                      {event.actor?.name ?? 'Sistema'} •{' '}
                      {dateTime(event.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="detail-side">
          <section className="panel sticky">
            <h2>Detalhes</h2>

            <Detail label="Solicitante" value={ticket.requester.name} />
            <Detail
              label="Responsável"
              value={ticket.assignee?.name ?? 'Não atribuído'}
            />
            <Detail label="Categoria" value={ticket.category.name} />
            <Detail label="Atualizado" value={dateTime(ticket.updatedAt)} />

            {staff && (
              <div className="admin-controls">
                <label>
                  Status
                  <select
                    value={ticket.status}
                    onChange={(e) =>
                      void patch({ status: e.target.value as TicketStatus })
                    }
                    disabled={saving}
                  >
                    {Object.entries(statusLabel).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Prioridade
                  <select
                    value={ticket.priority}
                    onChange={(e) =>
                      void patch({ priority: e.target.value as Priority })
                    }
                    disabled={saving}
                  >
                    {Object.entries(priorityLabel).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Categoria
                  <select
                    value={ticket.category.id}
                    onChange={(e) =>
                      void patch({ categoryId: Number(e.target.value) })
                    }
                    disabled={saving}
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Responsável
                  <select
                    value={ticket.assignee?.id ?? ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        void patch({ assigneeId: Number(e.target.value) })
                      }
                    }}
                    disabled={saving}
                  >
                    <option value="">Selecione...</option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}
