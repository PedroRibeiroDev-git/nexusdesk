import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, ApiError } from '../lib/api'
import type { Category, Priority, TicketDetail } from '../types'

export function NewTicketPage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('MEDIUM')
  const [categoryId, setCategoryId] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api<Category[]>('/categories')
      .then((data) => {
        setCategories(data)
        if (data[0]) setCategoryId(String(data[0].id))
      })
      .catch(() => setError('Não foi possível carregar as categorias.'))
  }, [])

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const created = await api<TicketDetail>('/tickets', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          priority,
          categoryId: Number(categoryId),
        }),
      })
      navigate(`/tickets/${created.id}`)
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Falha ao criar chamado.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page narrow">
      <div className="page-header">
        <div>
          <span className="eyebrow">NOVA SOLICITAÇÃO</span>
          <h1>Abrir chamado</h1>
          <p>Descreva o contexto com clareza para acelerar o atendimento.</p>
        </div>
      </div>

      <form className="panel form-stack" onSubmit={submit}>
        {error && <div className="alert error">{error}</div>}

        <label>
          Título
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            minLength={5}
            maxLength={160}
            placeholder="Ex.: Erro ao acessar sistema financeiro"
            required
          />
        </label>

        <div className="form-grid">
          <label>
            Categoria
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              {categories.map((category) => (
                <option value={category.id} key={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Prioridade
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
            >
              <option value="LOW">Baixa</option>
              <option value="MEDIUM">Média</option>
              <option value="HIGH">Alta</option>
              <option value="URGENT">Urgente</option>
            </select>
          </label>
        </div>

        <label>
          Descrição
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={9}
            minLength={10}
            maxLength={5000}
            placeholder="O que aconteceu? Quando começou? Qual o impacto?"
            required
          />
        </label>

        <div className="form-actions">
          <button
            className="button ghost"
            type="button"
            onClick={() => navigate(-1)}
          >
            Cancelar
          </button>
          <button className="button primary" disabled={submitting}>
            {submitting ? 'Criando...' : 'Criar chamado'}
          </button>
        </div>
      </form>
    </div>
  )
}
