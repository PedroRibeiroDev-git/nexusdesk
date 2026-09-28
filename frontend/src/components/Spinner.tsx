export function Spinner({ full = false }: { full?: boolean }) {
  return (
    <div className={full ? 'loading-screen' : 'loading-inline'}>
      <span className="spinner" />
      {full && <span>Carregando NexusDesk...</span>}
    </div>
  )
}
