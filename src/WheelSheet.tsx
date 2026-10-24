import { useEffect, useRef, useState } from 'react'
import { DEFS, type CfgKey } from './hiit'

const ITEM_H = 44
const R60 = Array.from({ length: 60 }, (_, i) => i)

type Props = {
  field: CfgKey | null // null = fechada
  value: number
  onCancel: () => void
  onConfirm: (value: number) => void
}

// Bottom sheet com rodas de rolagem (estilo seletor do iOS)
export function WheelSheet({ field, value, onCancel, onConfirm }: Props) {
  // mantém o último campo montado para o conteúdo não sumir durante a animação de saída
  const [shown, setShown] = useState<CfgKey | null>(field)
  const [vals, setVals] = useState<[number, number]>([0, 0])
  const cols = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)]

  useEffect(() => {
    if (!field) return
    const d = DEFS[field]
    const v: [number, number] = d.kind === 'time' ? [Math.floor(value / 60), value % 60] : [value - d.from, 0]
    setShown(field)
    setVals(v)
    requestAnimationFrame(() => {
      cols.forEach((r, i) => {
        if (r.current) r.current.scrollTop = v[i] * ITEM_H
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field])

  const def = shown ? DEFS[shown] : null
  const columns: { items: number[]; unit: string }[] = !def
    ? []
    : def.kind === 'time'
      ? [
          { items: R60, unit: 'min' },
          { items: R60, unit: 's' },
        ]
      : [{ items: Array.from({ length: def.to - def.from + 1 }, (_, i) => def.from + i), unit: def.unit }]

  const onScroll = (ci: number, el: HTMLDivElement) => {
    const max = columns[ci].items.length - 1
    const i = Math.max(0, Math.min(max, Math.round(el.scrollTop / ITEM_H)))
    if (i !== vals[ci]) setVals((sv) => (ci === 0 ? [i, sv[1]] : [sv[0], i]))
  }

  const confirm = () => {
    if (!def) return
    const v = def.kind === 'time' ? Math.max(def.min, vals[0] * 60 + vals[1]) : def.from + vals[0]
    onConfirm(v)
  }

  const open = field !== null
  return (
    <>
      <div className={`backdrop${open ? ' open' : ''}`} onClick={onCancel} />
      <div className={`sheet${open ? ' open' : ''}`} aria-hidden={!open}>
        <div className="sheet-handle" />
        <div style={{ textAlign: 'center' }}>
          <div className="kicker">{def?.kicker}</div>
          <h2>{def?.label}</h2>
        </div>
        <div className="wheels">
          <div className="wheel-band" />
          {columns.map((col, ci) => (
            <div key={`${shown}-${ci}`} ref={cols[ci]} className="wheel" onScroll={(e) => onScroll(ci, e.currentTarget)}>
              {col.items.map((n, i) => (
                <div key={n} className="wheel-item" style={{ opacity: Math.max(0.15, 1 - Math.abs(i - vals[ci]) * 0.28) }}>
                  <span className="n num">{n}</span>
                  <span className="u">{col.unit}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="btn-row">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={confirm}>
            Definir
          </button>
        </div>
      </div>
    </>
  )
}
