export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="logo-wrap" aria-label="NexusDesk">
      <span className="logo-mark">N</span>
      {!compact && (
        <span className="logo-text">
          Nexus<span>Desk</span>
        </span>
      )}
    </div>
  )
}
