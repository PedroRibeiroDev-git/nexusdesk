import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Spinner } from '../components/Spinner'
import { TicketTable } from '../components/TicketTable'
import { useAuth } from '../context/AuthContext'
import { api, ApiError } from '../lib/api'
import type { Dashboard } from '../types'

export function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState<Dashboard | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api<Dashboard>('/dashboard')
      .then(setData)
      .catch((err) =>
        setError(
          err instanceof ApiError
            ? err.message
            : 'Falha ao carregar dashboard.',
        ),
      )
  }, [])

  if (!data && !error) return <Spinner full />

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">CENTRAL DE OPERAÇÕES</span>
          <h1>Olá, {user?.name.split(' ')[0]}.</h1>
          <p>
            Acompanhe o que precisa de atenção e mantenha o fluxo de suporte
            em movimento.
          </p>
        </div>
        <Link className="button primary" to="/tickets/new">
          ＋ Abrir chamado
        </Link>
      </div>

      {error && <div className="alert error">{error}</div>}

      {data && (
        <>
          <div className="stats-grid">
            <Stat label="Abertos" value={data.open} accent="blue" />
            <Stat
              label="Em andamento"
              value={data.inProgress}
              accent="purple"
            />
            <Stat
              label="Aguardando"
              value={data.waitingCustomer}
              accent="yellow"
            />
            <Stat label="Resolvidos" value={data.resolved} accent="green" />
            {user?.role !== 'CLIENT' && (
              <Stat
                label="Sem responsável"
                value={data.unassigned}
                accent="red"
              />
            )}
          </div>

          <section className="panel">
            <div className="panel-head">
              <div>
                <h2>Chamados recentes</h2>
                <p>Últimas movimentações da central.</p>
              </div>
              <Link to="/tickets">Ver todos →</Link>
            </div>
            <TicketTable tickets={data.recentTickets} />
          </section>
        </>
      )}
    </div>
  )
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string
  value: number
  accent: string
}) {
  return (
    <div className={`stat-card ${accent}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>chamado{value === 1 ? '' : 's'}</small>
    </div>
  )
}
