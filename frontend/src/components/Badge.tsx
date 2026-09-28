import { priorityLabel, statusLabel } from '../lib/format'
import type { Priority, TicketStatus } from '../types'

export function StatusBadge({ value }: { value: TicketStatus }) {
  return (
    <span className={`badge status-${value.toLowerCase()}`}>
      {statusLabel[value]}
    </span>
  )
}

export function PriorityBadge({ value }: { value: Priority }) {
  return (
    <span className={`badge priority-${value.toLowerCase()}`}>
      {priorityLabel[value]}
    </span>
  )
}
