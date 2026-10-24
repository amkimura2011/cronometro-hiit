// Lógica pura do treino: configuração, sequência de fases e formatação.

export type Cfg = {
  countdown: number
  work: number
  rest: number
  series: number
  cycles: number
  cycleRest: number
}
export type CfgKey = keyof Cfg
export type Prefs = { sound: boolean; wake: boolean }
export type PhaseType = 'prep' | 'work' | 'rest' | 'interval'
export type Phase = { type: PhaseType; dur: number; s: number; c: number }

export const DEFAULT_CFG: Cfg = { countdown: 10, work: 45, rest: 15, series: 8, cycles: 4, cycleRest: 90 }
export const DEFAULT_PREFS: Prefs = { sound: true, wake: true }

type TimeDef = { label: string; kicker: string; kind: 'time'; min: number }
type CountDef = { label: string; kicker: string; kind: 'count'; from: number; to: number; unit: string }
export type FieldDef = TimeDef | CountDef

export const DEFS: Record<CfgKey, FieldDef> = {
  countdown: { label: 'Contagem regressiva', kicker: 'Antes de começar', kind: 'time', min: 0 },
  work: { label: 'Exercício', kicker: 'Duração de cada série', kind: 'time', min: 1 },
  rest: { label: 'Recuperação', kicker: 'Descanso entre séries', kind: 'time', min: 0 },
  cycleRest: { label: 'Intervalo entre ciclos', kicker: 'Descanso entre ciclos', kind: 'time', min: 0 },
  series: { label: 'Séries', kicker: 'Por ciclo', kind: 'count', from: 1, to: 30, unit: 'séries' },
  cycles: { label: 'Ciclos', kicker: 'Repetições do bloco', kind: 'count', from: 1, to: 20, unit: 'ciclos' },
}

export const TITLES: Record<PhaseType, string> = {
  prep: 'Preparar',
  work: 'Exercício',
  rest: 'Recuperação',
  interval: 'Intervalo entre ciclos',
}

export const COLORS: Record<PhaseType, string> = {
  prep: 'var(--color-accent)',
  work: 'var(--color-accent)',
  rest: 'var(--color-neutral-500)',
  interval: 'var(--color-accent-700)',
}

// prep → (work, rest)* por ciclo, sem rest após a última série → interval entre ciclos
export function buildPhases(cfg: Cfg): Phase[] {
  const p: Phase[] = []
  if (cfg.countdown > 0) p.push({ type: 'prep', dur: cfg.countdown, s: 0, c: 0 })
  for (let c = 1; c <= cfg.cycles; c++) {
    for (let s = 1; s <= cfg.series; s++) {
      p.push({ type: 'work', dur: cfg.work, s, c })
      if (s < cfg.series && cfg.rest > 0) p.push({ type: 'rest', dur: cfg.rest, s, c })
    }
    if (c < cfg.cycles && cfg.cycleRest > 0) p.push({ type: 'interval', dur: cfg.cycleRest, s: cfg.series, c })
  }
  return p
}

// "45 s", "1 min", "1 min 30 s"
export function dur(s: number): string {
  if (s < 60) return `${s} s`
  const m = Math.floor(s / 60)
  const r = s % 60
  return r ? `${m} min ${r} s` : `${m} min`
}

// "05:30" ou "1:05:30"
export function mmss(s: number): string {
  s = Math.max(0, Math.round(s))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const r = s % 60
  const p = (n: number) => String(n).padStart(2, '0')
  return h ? `${h}:${p(m)}:${p(r)}` : `${p(m)}:${p(r)}`
}

export function load<T extends object>(key: string, fallback: T): T {
  try {
    return { ...fallback, ...(JSON.parse(localStorage.getItem(key) ?? 'null') ?? {}) }
  } catch {
    return fallback
  }
}

export function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // armazenamento indisponível (aba privada): segue sem persistir
  }
}
