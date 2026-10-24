import { Dumbbell, Heart, Hourglass, Settings2, SkipForward, Square, Timer } from 'lucide-react'
import { COLORS, TITLES, dur, mmss, type Cfg, type Phase } from './hiit'
import type { Run } from './useHiitTimer'

// Constantes que eram "tweaks" do protótipo
const OUTER_RING = 'treino' as 'treino' | 'ciclo' // anel externo: treino inteiro ou ciclo atual
const SHOW_NEXT = true

const OUTER_C = 2 * Math.PI * 152 // 955.04
const INNER_C = 2 * Math.PI * 122 // 766.55

// 60 marcas de minuto; a cada 5ª, mais longa e mais grossa
const TICKS = Array.from({ length: 60 }, (_, i) => {
  const a = ((i * 6 - 90) * Math.PI) / 180
  const major = i % 5 === 0
  const r1 = major ? 131 : 135
  const r2 = 141
  return {
    x1: 160 + r1 * Math.cos(a),
    y1: 160 + r1 * Math.sin(a),
    x2: 160 + r2 * Math.cos(a),
    y2: 160 + r2 * Math.sin(a),
    w: major ? 1.2 : 0.6,
  }
})

type Props = {
  cfg: Cfg
  phases: Phase[]
  run: Run
  now: number
  onPrimary: () => void
  onStop: () => void
  onSkip: () => void
  onSettings: () => void
}

export function TimerScreen({ cfg, phases: ph, run, now, onPrimary, onStop, onSkip, onSettings }: Props) {
  const total = ph.reduce((a, p) => a + p.dur, 0)
  const idle = run.status === 'idle'
  const done = run.status === 'done'
  const active = !idle && !done
  const cur = ph[run.idx] ?? ph[0]
  const el = active ? (run.status === 'running' ? run.acc + now - run.t0 : run.acc) / 1000 : 0
  const rem = Math.max(0, cur.dur - el)
  const after = ph.slice(run.idx + 1).reduce((a, p) => a + p.dur, 0)
  const totalRem = done ? 0 : idle ? total : rem + after
  const nextP = ph[run.idx + 1]

  let outerFrac = 0
  if (active) {
    if (OUTER_RING === 'ciclo' && cur.c > 0) {
      const cp = ph.map((p, i) => ({ p, i })).filter((x) => x.p.c === cur.c && x.p.type !== 'interval' && x.p.type !== 'prep')
      const ct = cp.reduce((a, x) => a + x.p.dur, 0)
      const cRem = cur.type === 'interval' ? 0 : cp.filter((x) => x.i > run.idx).reduce((a, x) => a + x.p.dur, 0) + rem
      outerFrac = ct ? cRem / ct : 0
    } else outerFrac = total ? totalRem / total : 0
  }
  const innerFrac = active ? rem / cur.dur : 0

  const kicker = idle
    ? 'Cronômetro intervalado'
    : done
      ? 'Treino concluído'
      : run.status === 'paused'
        ? 'Em pausa'
        : cur.type === 'prep'
          ? 'Contagem regressiva'
          : `Ciclo ${cur.c} · Série ${cur.s}`
  const title = idle ? 'Pronto' : done ? 'Concluído' : TITLES[cur.type]
  const seriesStat = idle || done || cur.type === 'prep' ? `—/${cfg.series}` : `${cur.s}/${cfg.series}`
  const cycleStat = idle || cur.type === 'prep' ? `—/${cfg.cycles}` : done ? `${cfg.cycles}/${cfg.cycles}` : `${cur.c}/${cfg.cycles}`
  const nextLine = idle
    ? `${dur(cfg.work)} de esforço, ${dur(cfg.rest)} de recuperação`
    : done
      ? 'Bom trabalho.'
      : SHOW_NEXT
        ? nextP
          ? `A seguir — ${TITLES[nextP.type]}, ${dur(nextP.dur)}`
          : 'Último trecho'
        : ''
  const primaryLabel = idle ? 'Iniciar' : done ? 'Recomeçar' : run.status === 'running' ? 'Pausar' : 'Retomar'

  const Icon = !active || cur.type === 'prep' ? Timer : cur.type === 'work' ? Dumbbell : cur.type === 'rest' ? Heart : Hourglass

  return (
    <main className="screen">
      <header className="timer-header">
        <div className="kicker">{kicker}</div>
        <h1>{title}</h1>
      </header>

      <div className="stats">
        <div className="stat">
          <div className="stat-value num">{seriesStat}</div>
          <div className="stat-label">Séries</div>
        </div>
        <div className="sep" />
        <div className="stat">
          <div className="stat-value num">{cycleStat}</div>
          <div className="stat-label">Ciclos</div>
        </div>
      </div>

      <div className="rings-area">
        <div className="rings">
          <svg className="dial" viewBox="0 0 320 320">
            {TICKS.map((t, i) => (
              <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="var(--color-neutral-400)" strokeWidth={t.w} />
            ))}
            <circle cx="160" cy="160" r="152" fill="none" stroke="var(--color-divider)" strokeWidth="1" />
            <circle
              cx="160" cy="160" r="152" fill="none" stroke="var(--color-text)" strokeWidth="7" strokeLinecap="round"
              strokeDasharray={OUTER_C} strokeDashoffset={OUTER_C * (1 - outerFrac)} transform="rotate(-90 160 160)"
            />
            <circle cx="160" cy="160" r="122" fill="none" stroke="var(--color-divider)" strokeWidth="1" />
            <circle
              cx="160" cy="160" r="122" fill="none" stroke={COLORS[cur.type]} strokeWidth="7" strokeLinecap="round"
              strokeDasharray={INNER_C} strokeDashoffset={INNER_C * (1 - innerFrac)} transform="rotate(-90 160 160)"
            />
          </svg>
          <div className="rings-center">
            <div className="rings-icon">
              <Icon size={22} strokeWidth={1.5} />
            </div>
            <div className="big-number num" style={{ fontSize: active ? 'clamp(80px, 26vw, 124px)' : 'clamp(56px, 17vw, 80px)' }}>
              {idle ? mmss(total) : done ? 'Fim' : String(Math.ceil(rem - 0.001)).padStart(2, '0')}
            </div>
            <div className="sub">
              <div className="sub-number num">{idle ? `${cfg.series} × ${cfg.cycles}` : done ? mmss(total) : mmss(totalRem)}</div>
              <div className="sub-label">{idle ? 'séries × ciclos' : done ? 'de treino' : 'restante'}</div>
            </div>
          </div>
        </div>
      </div>

      <p className="next-line">{nextLine}</p>

      <div className="controls">
        <button className="round-btn" aria-label="Parar" onClick={onStop} disabled={idle}>
          <Square size={20} strokeWidth={1.5} />
        </button>
        <button className="main-btn" onClick={onPrimary}>
          {primaryLabel}
        </button>
        {active ? (
          <button className="round-btn" aria-label="Pular" onClick={onSkip}>
            <SkipForward size={22} strokeWidth={1.5} />
          </button>
        ) : (
          <button className="round-btn" aria-label="Configurações" onClick={onSettings}>
            <Settings2 size={22} strokeWidth={1.5} />
          </button>
        )}
      </div>
    </main>
  )
}
