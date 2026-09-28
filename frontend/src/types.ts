export type Role = 'CLIENT' | 'AGENT' | 'ADMIN'
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_CUSTOMER' | 'RESOLVED' | 'CLOSED'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface User {
  id: number
  name: string
  email: string
  role: Role
  active: boolean
}

export interface UserBrief {
  id: number
  name: string
  role: Role
}

export interface Category {
  id: number
  name: string
  description: string
}

export interface TicketSummary {
  id: number
  code: string
  title: string
  status: TicketStatus
  priority: Priority
  category: Category
  requester: UserBrief
  assignee: UserBrief | null
  createdAt: string
  updatedAt: string
}

export interface TicketComment {
  id: number
  author: UserBrief
  body: string
  internal: boolean
  createdAt: string
}

export interface TicketEvent {
  id: number
  type: string
  details: string
  actor: UserBrief | null
  createdAt: string
}

export interface TicketDetail extends TicketSummary {
  description: string
  resolvedAt: string | null
  version: number
  comments: TicketComment[]
  events: TicketEvent[]
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface Dashboard {
  open: number
  inProgress: number
  waitingCustomer: number
  resolved: number
  closed: number
  unassigned: number
  recentTickets: TicketSummary[]
}

export interface AdminUser extends User {
  createdAt: string
}
