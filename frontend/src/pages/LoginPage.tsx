import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../lib/api'

const demos = [
  ['Administrador', 'admin@nexusdesk.dev', 'Admin@123'],
  ['Agente', 'agent@nexusdesk.dev', 'Agent@123'],
  ['Cliente', 'client@nexusdesk.dev', 'Client@123'],
] as const

export function LoginPage() {
  const { user, login } = useAuth()
  const [email, setEmail] = useState('admin@nexusdesk.dev')
  const [password, setPassword] = useState('Admin@123')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to="/" replace />

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await login(email, password)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha ao entrar.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <section className="login-brand">
        <Logo />
        <div className="hero-copy">
          <span className="eyebrow">SERVICE DESK • FULL STACK</span>
          <h1>
            Suporte conectado.
            <br />
            <span>Operação sob controle.</span>
          </h1>
          <p>
            Centralize chamados, priorize atendimentos e acompanhe cada
            interação com uma experiência simples para clientes e equipes.
          </p>
          <div className="feature-row">
            <span>✓ RBAC + JWT</span>
            <span>✓ Auditoria</span>
            <span>✓ Dashboard</span>
          </div>
        </div>
        <div className="login-grid-art" aria-hidden="true" />
      </section>

      <section className="login-panel">
        <form className="login-card" onSubmit={submit}>
          <div>
            <span className="eyebrow">BEM-VINDO</span>
            <h2>Acesse sua conta</h2>
            <p>Use uma das contas de demonstração ou suas credenciais.</p>
          </div>

          {error && <div className="alert error">{error}</div>}

          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Senha
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button className="button primary large" disabled={submitting}>
            {submitting ? 'Entrando...' : 'Entrar no NexusDesk'}
          </button>

          <div className="demo-box">
            <strong>Contas de demonstração</strong>
            {demos.map(([label, demoEmail, demoPassword]) => (
              <button
                type="button"
                key={label}
                onClick={() => {
                  setEmail(demoEmail)
                  setPassword(demoPassword)
                }}
              >
                <span>{label}</span>
                <code>{demoEmail}</code>
              </button>
            ))}
          </div>
        </form>
      </section>
    </div>
  )
}
