const API_BASE = '/api'

export class ApiError extends Error {
  status: number
  fieldErrors?: Record<string, string>

  constructor(message: string, status: number, fieldErrors?: Record<string, string>) {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('nexusdesk_token')
  const headers = new Headers(options.headers)

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (response.status === 401) {
    localStorage.removeItem('nexusdesk_token')
    window.dispatchEvent(new Event('nexusdesk:unauthorized'))
  }

  if (!response.ok) {
    let message = 'Não foi possível concluir a operação.'
    let fieldErrors: Record<string, string> | undefined

    try {
      const data = await response.json()
      message = data.message ?? message
      fieldErrors = data.fieldErrors
    } catch {
      // Mantém a mensagem padrão.
    }

    throw new ApiError(message, response.status, fieldErrors)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}
