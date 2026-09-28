import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { roleLabel } from '../lib/format'
import { Logo } from './Logo'

export function AppLayout() {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-head">
          <Logo />
        </div>

        <nav className="nav-list">
          <NavLink to="/" end>
            <span className="nav-icon">▦</span>
            <span>Visão geral</span>
          </NavLink>
          <NavLink to="/tickets">
            <span className="nav-icon">◫</span>
            <span>Chamados</span>
          </NavLink>
          <NavLink to="/tickets/new">
            <span className="nav-icon">＋</span>
            <span>Novo chamado</span>
          </NavLink>
          {user.role === 'ADMIN' && (
            <NavLink to="/admin/users">
              <span className="nav-icon">♙</span>
              <span>Usuários</span>
            </NavLink>
          )}
        </nav>

        <div className="sidebar-foot">
          <div className="user-chip">
            <div className="avatar">{user.name.slice(0, 2).toUpperCase()}</div>
            <div>
              <strong>{user.name}</strong>
              <span>{roleLabel[user.role]}</span>
            </div>
          </div>
          <button className="button ghost full" onClick={logout}>
            Sair
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="mobile-header">
          <Logo />
          <button className="button ghost" onClick={logout}>
            Sair
          </button>
        </header>
        <Outlet />

        <nav className="mobile-nav" aria-label="Navegação principal">
          <NavLink to="/" end>
            <span>▦</span>
            <small>Início</small>
          </NavLink>
          <NavLink to="/tickets">
            <span>◫</span>
            <small>Chamados</small>
          </NavLink>
          <NavLink to="/tickets/new">
            <span>＋</span>
            <small>Novo</small>
          </NavLink>
          {user.role === 'ADMIN' && (
            <NavLink to="/admin/users">
              <span>♙</span>
              <small>Usuários</small>
            </NavLink>
          )}
        </nav>
      </main>
    </div>
  )
}
