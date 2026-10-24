import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { beep, celebrate, unlock as unlockAudio } from './audio'
import { buildPhases, type Cfg, type PhaseType, type Prefs } from './hiit'

export type RunStatus = 'idle' | 'running' | 'paused' | 'done'
// acc = ms já decorridos na fase antes da última retomada; t0 = instante da retomada
export type Run = { status: RunStatus; idx: number; acc: number; t0: number }

const IDLE: Run = { status: 'idle', idx: 0, acc: 0, t0: 0 }

// Timer baseado em timestamp (Date.now), não em contagem de ticks:
// ao voltar do segundo plano, o laço avança todas as fases vencidas.
export function useHiitTimer(cfg: Cfg, prefs: Prefs) {
  const phases = useMemo(() => buildPhases(cfg), [cfg])
  const [run, setRunState] = useState<Run>(IDLE)
  const [now, setNow] = useState(() => Date.now())

  const runRef = useRef(run)
  const phasesRef = useRef(phases)
  const prefsRef = useRef(prefs)
  const lastSec = useRef<number | null>(null)
  const wakeLock = useRef<WakeLockSentinel | null>(null)

  useEffect(() => {
    phasesRef.current = phases
    prefsRef.current = prefs
  }, [phases, prefs])

  const setRun = useCallback((r: Run) => {
    runRef.current = r
    setRunState(r)
  }, [])

  const phaseBeep = useCallback((type: PhaseType | 'done') => {
    if (!prefsRef.current.sound) return
    if (type === 'work') beep(1046, 0.5)
    else if (type === 'done') celebrate()
    else beep(523, 0.45)
  }, [])

  const lock = useCallback(async () => {
    if (!prefsRef.current.wake || !('wakeLock' in navigator)) return
    try {
      wakeLock.current = await navigator.wakeLock.request('screen')
    } catch {
      // negado pelo sistema (ex.: modo de pouca energia)
    }
  }, [])

  const release = useCallback(() => {
    void wakeLock.current?.release().catch(() => {})
    wakeLock.current = null
  }, [])

  const finish = useCallback(() => {
    phaseBeep('done')
    release()
    setRun({ status: 'done', idx: phasesRef.current.length - 1, acc: 0, t0: 0 })
  }, [phaseBeep, release, setRun])

  // laço de 100 ms
  useEffect(() => {
    const iv = setInterval(() => {
      const r = runRef.current
      if (r.status !== 'running') return
      const ph = phasesRef.current
      const t = Date.now()
      let idx = r.idx
      let el = r.acc + t - r.t0
      let changed = false
      while (idx < ph.length && el >= ph[idx].dur * 1000) {
        el -= ph[idx].dur * 1000
        idx++
        changed = true
      }
      if (idx >= ph.length) {
        finish()
        setNow(t)
        return
      }
      if (changed) {
        setRun({ status: 'running', idx, acc: 0, t0: t - el })
        phaseBeep(ph[idx].type)
        lastSec.current = null
      }
      // bipe curto nos últimos 3 s de cada fase
      const remSec = Math.ceil((ph[idx].dur * 1000 - el) / 1000)
      if (remSec <= 3 && remSec >= 1 && remSec !== lastSec.current && ph[idx].dur > 3 && prefsRef.current.sound) {
        beep(880, 0.12)
      }
      lastSec.current = remSec
      setNow(t)
    }, 100)
    return () => clearInterval(iv)
  }, [finish, phaseBeep, setRun])

  // o iOS solta o wake lock quando o app sai de cena; reaquirir ao voltar
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible' && runRef.current.status === 'running') void lock()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      release()
    }
  }, [lock, release])

  const primary = useCallback(() => {
    const r = runRef.current
    const t = Date.now()
    unlockAudio()
    if (r.status === 'idle' || r.status === 'done') {
      phaseBeep(phasesRef.current[0].type)
      lastSec.current = null
      void lock()
      setRun({ status: 'running', idx: 0, acc: 0, t0: t })
    } else if (r.status === 'running') {
      release()
      setRun({ ...r, status: 'paused', acc: r.acc + t - r.t0 })
    } else {
      void lock()
      setRun({ ...r, status: 'running', t0: t })
    }
    setNow(t)
  }, [lock, phaseBeep, release, setRun])

  const stop = useCallback(() => {
    release()
    setRun(IDLE)
  }, [release, setRun])

  const skip = useCallback(() => {
    const r = runRef.current
    const ph = phasesRef.current
    const t = Date.now()
    if (r.idx + 1 >= ph.length) return finish()
    phaseBeep(ph[r.idx + 1].type)
    lastSec.current = null
    setRun({ status: r.status, idx: r.idx + 1, acc: 0, t0: t })
    setNow(t)
  }, [finish, phaseBeep, setRun])

  return { phases, run, now, primary, stop, skip }
}
