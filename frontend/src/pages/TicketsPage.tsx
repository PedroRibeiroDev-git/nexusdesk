import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Spinner } from '../components/Spinner'
import { TicketTable } from '../components/TicketTable'
import { api, ApiError } from '../lib/api'
import type {
  Category,
  PageResponse,
  Priority,
  TicketStatus,
  TicketSummary,
} from '../types'

export function TicketsPage() {
  const [data, setData] = useState<PageResponse<TicketSummary> | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<TicketStatus | ''>('')
  const [priority, setPriority] = useState<Priority | ''>('')
  const [categoryId, setCategoryId] = useState('')
  const [page, setPage] = useState(0)

  useEffect(() => {
    api<Category[]>('/categories')
      .then(setCategories)
      .catch(() => undefined)
  }, [])

  const query = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      size: '12',
    })

    if (search.trim()) params.set('search', search.trim())
    if (status) params.set('status', status)
    if (priority) params.set('priority', priority)
    if (categoryId) params.set('categoryId', categoryId)

    return params.toString()
  }, [search, status, priority, categoryId, page])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(true)
      setError('')

      api<PageResponse<TicketSummary>>(`/tickets?${query}`)
        .then(setData)
        .catch((err) =>
          setError(
            err instanceof ApiError
              ? err.message
              : 'Falha ao carregar chamados.',
          ),
        )
        .finally(() => setLoading(false))
    }, 200)

    return () => clearTimeout(timer)
  }, [query])

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">ATENDIMENTO</span>
          <h1>Chamados</h1>
          <p>Pesquise, filtre e acompanhe o ciclo completo de cada solicitação.</p>
        </div>
        <Link className="button primary" to="/tickets/new">
          ＋ Novo chamado
        </Link>
      </div>

      <section className="panel">
        <div className="filters">
          <input
            className="search-input"
            placeholder="Buscar por código ou título..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(0)
            }}
          />

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as TicketStatus | '')
              setPage(0)
            }}
          >
            <option value="">Todos os status</option>
            <option value="OPEN">Aberto</option>
            <option value="IN_PROGRESS">Em andamento</option>
            <option value="WAITING_CUSTOMER">Aguardando cliente</option>
            <option value="RESOLVED">Resolvido</option>
            <option value="CLOSED">Fechado</option>
          </select>

          <select
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value as Priority | '')
              setPage(0)
            }}
          >
            <option value="">Todas prioridades</option>
            <option value="LOW">Baixa</option>
            <option value="MEDIUM">Média</option>
            <option value="HIGH">Alta</option>
            <option value="URGENT">Urgente</option>
          </select>

          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value)
              setPage(0)
            }}
          >
            <option value="">Todas categorias</option>
            {categories.map((category) => (
              <option value={category.id} key={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {error && <div className="alert error">{error}</div>}

        {loading ? (
          <Spinner />
        ) : (
          data && (
            <>
              <TicketTable tickets={data.content} />
              <div className="pagination">
                <span>
                  {data.totalElements} resultado
                  {data.totalElements === 1 ? '' : 's'}
                </span>
                <div>
                  <button
                    className="button ghost"
                    disabled={page === 0}
                    onClick={() => setPage((value) => value - 1)}
                  >
                    ← Anterior
                  </button>
                  <span>
                    Página {data.page + 1} de {Math.max(data.totalPages, 1)}
                  </span>
                  <button
                    className="button ghost"
                    disabled={page + 1 >= data.totalPages}
                    onClick={() => setPage((value) => value + 1)}
                  >
                    Próxima →
                  </button>
                </div>
              </div>
            </>
          )
        )}
      </section>
    </div>
  )
}
