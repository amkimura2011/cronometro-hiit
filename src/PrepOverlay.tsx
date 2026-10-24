type Props = {
  number: number
  next: string
  primaryLabel: string
  onCancel: () => void
  onPrimary: () => void
}

// Contagem regressiva em tela cheia, exibida durante a fase "prep"
export function PrepOverlay({ number, next, primaryLabel, onCancel, onPrimary }: Props) {
  return (
    <div className="prep">
      <div className="prep-body">
        <div className="kicker">Prepare-se</div>
        <div className="prep-number num">{number}</div>
        <div className="prep-rule" />
        <p className="prep-next">{next}</p>
      </div>
      <div className="btn-row">
        <button className="btn btn-secondary btn-lg" onClick={onCancel}>
          Cancelar
        </button>
        <button className="btn btn-primary btn-lg" onClick={onPrimary}>
          {primaryLabel}
        </button>
      </div>
    </div>
  )
}
