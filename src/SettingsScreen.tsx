import type { ReactNode } from 'react'
import { ChevronLeft, ChevronRight, Dumbbell, Heart, Hourglass, Layers, Repeat, Sun, Timer, Volume2 } from 'lucide-react'
import { dur, mmss, type Cfg, type CfgKey, type Prefs } from './hiit'

type Props = {
  cfg: Cfg
  prefs: Prefs
  total: number
  onBack: () => void
  onEdit: (key: CfgKey) => void
  onToggle: (key: keyof Prefs) => void
}

const ic = { size: 22, strokeWidth: 1.5 }

function Row({ icon, label, suffix, value, onClick }: { icon: ReactNode; label: string; suffix?: string; value: string; onClick: () => void }) {
  return (
    <button className="row" onClick={onClick}>
      {icon}
      <span className="row-label">
        {label} {suffix && <span className="row-suffix">· {suffix}</span>}
      </span>
      <span className="row-value num">{value}</span>
      <ChevronRight size={16} strokeWidth={1.5} color="var(--color-neutral-500)" />
    </button>
  )
}

function ToggleRow({ icon, label, on, onClick }: { icon: ReactNode; label: string; on: boolean; onClick: () => void }) {
  return (
    <button className="row toggle-row" role="switch" aria-checked={on} onClick={onClick}>
      {icon}
      <span className="row-label">{label}</span>
      <span className={`toggle${on ? ' on' : ''}`} />
    </button>
  )
}

export function SettingsScreen({ cfg, prefs, total, onBack, onEdit, onToggle }: Props) {
  const plural = (n: number, s: string, p: string) => `${n} ${n > 1 ? p : s}`
  const summary = `${plural(cfg.cycles, 'ciclo', 'ciclos')} de ${plural(cfg.series, 'série', 'séries')}: ${dur(cfg.work)} de esforço e ${dur(cfg.rest)} de recuperação, com ${dur(cfg.cycleRest)} entre ciclos.`
  const muted = 'var(--color-neutral-700)'

  return (
    <main className="settings">
      <button className="btn btn-ghost back-btn" onClick={onBack}>
        <ChevronLeft {...ic} />
        Cronômetro
      </button>
      <h1>Configurações</h1>
      <p className="summary">{summary}</p>

      <div className="kicker section-kicker" style={{ marginTop: 0 }}>Tempos</div>
      <div className="group">
        <Row icon={<Timer {...ic} color={muted} />} label="Contagem regressiva" value={dur(cfg.countdown)} onClick={() => onEdit('countdown')} />
        <Row icon={<Dumbbell {...ic} color="var(--color-accent)" />} label="Exercício" suffix="por série" value={dur(cfg.work)} onClick={() => onEdit('work')} />
        <Row icon={<Heart {...ic} color={muted} />} label="Recuperação" suffix="entre séries" value={dur(cfg.rest)} onClick={() => onEdit('rest')} />
        <Row icon={<Hourglass {...ic} color="var(--color-accent-700)" />} label="Intervalo entre ciclos" value={dur(cfg.cycleRest)} onClick={() => onEdit('cycleRest')} />
      </div>

      <div className="kicker section-kicker">Estrutura</div>
      <div className="group">
        <Row icon={<Layers {...ic} color={muted} />} label="Séries" suffix="por ciclo" value={String(cfg.series)} onClick={() => onEdit('series')} />
        <Row icon={<Repeat {...ic} color={muted} />} label="Ciclos" value={String(cfg.cycles)} onClick={() => onEdit('cycles')} />
      </div>

      <div className="kicker section-kicker">Preferências</div>
      <div className="group">
        <ToggleRow icon={<Volume2 {...ic} color={muted} />} label="Sinais sonoros" on={prefs.sound} onClick={() => onToggle('sound')} />
        <ToggleRow icon={<Sun {...ic} color={muted} />} label="Manter tela acesa" on={prefs.wake} onClick={() => onToggle('wake')} />
      </div>

      <div className="total">
        <span className="total-label">Tempo total do treino</span>
        <span className="total-value num">{mmss(total)}</span>
      </div>
    </main>
  )
}
