import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { api, ApiError } from '../lib/api'
import { dateTime, roleLabel } from '../lib/format'
import type { AdminUser, Role } from '../types'

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('CLIENT')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = useCallback(() => {
    return api<AdminUser[]>('/admin/users')
      .then(setUsers)
      .catch((err) =>
        setError(
          err instanceof ApiError
            ? err.message
            : 'Falha ao carregar usuários.',
        ),
      )
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function create(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSuccess('')

    try {
      await api<AdminUser>('/admin/users', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role }),
      })
      setName('')
      setEmail('')
      setPassword('')
      setRole('CLIENT')
      setSuccess('Usuário criado com sucesso.')
      await load()
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Falha ao criar usuário.',
      )
    }
  }

  async function update(id: number, payload: Record<string, unknown>) {
    setError('')
    setSuccess('')

    try {
      await api<AdminUser>(`/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
      await load()
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Falha ao atualizar usuário.',
      )
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">ADMINISTRAÇÃO</span>
          <h1>Usuários</h1>
          <p>Gerencie acessos e responsabilidades dentro do NexusDesk.</p>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      <div className="admin-users-grid">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Contas cadastradas</h2>
              <p>
                {users.length} usuário{users.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          <div className="user-list">
            {users.map((entry) => (
              <div className="user-row" key={entry.id}>
                <div className="avatar">
                  {entry.name.slice(0, 2).toUpperCase()}
                </div>

                <div className="user-info">
                  <strong>{entry.name}</strong>
                  <span>{entry.email}</span>
                  <small>Criado em {dateTime(entry.createdAt)}</small>
                </div>

                <select
                  value={entry.role}
                  onChange={(e) =>
                    void update(entry.id, { role: e.target.value as Role })
                  }
                >
                  {Object.entries(roleLabel).map(([value, label]) => (
                    <option value={value} key={value}>
                      {label}
                    </option>
                  ))}
                </select>

                <button
                  className={`button ${entry.active ? 'ghost' : 'primary'}`}
                  onClick={() =>
                    void update(entry.id, { active: !entry.active })
                  }
                >
                  {entry.active ? 'Desativar' : 'Ativar'}
                </button>
              </div>
            ))}
          </div>
        </section>

        <form className="panel form-stack sticky" onSubmit={create}>
          <div>
            <h2>Novo usuário</h2>
            <p>Crie uma conta para cliente, agente ou administrador.</p>
          </div>

          <label>
            Nome
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={3}
            />
          </label>

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
            Senha inicial
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </label>

          <label>
            Perfil
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              {Object.entries(roleLabel).map(([value, label]) => (
                <option value={value} key={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <button className="button primary">Criar usuário</button>
        </form>
      </div>
    </div>
  )
}
