import { useState } from 'react'
import { PrepOverlay } from './PrepOverlay'
import { SettingsScreen } from './SettingsScreen'
import { TimerScreen } from './TimerScreen'
import { WheelSheet } from './WheelSheet'
import { DEFAULT_CFG, DEFAULT_PREFS, TITLES, dur, load, save, type Cfg, type CfgKey, type Prefs } from './hiit'
import { useHiitTimer } from './useHiitTimer'

export default function App() {
  const [screen, setScreen] = useState<'timer' | 'settings'>('timer')
  const [cfg, setCfg] = useState<Cfg>(() => load('hiit.cfg', DEFAULT_CFG))
  const [prefs, setPrefs] = useState<Prefs>(() => load('hiit.prefs', DEFAULT_PREFS))
  const [sheet, setSheet] = useState<CfgKey | null>(null)
  const { phases, run, now, primary, stop, skip } = useHiitTimer(cfg, prefs)

  const total = phases.reduce((a, p) => a + p.dur, 0)
  const cur = phases[run.idx] ?? phases[0]
  const active = run.status === 'running' || run.status === 'paused'
  const showPrep = active && cur.type === 'prep'

  const openSettings = () => {
    stop()
    setScreen('settings')
  }

  // alterar a configuração sempre volta o cronômetro para "Pronto"
  const confirmSheet = (v: number) => {
    if (!sheet) return
    const next = { ...cfg, [sheet]: v }
    save('hiit.cfg', next)
    setCfg(next)
    setSheet(null)
    stop()
  }

  const togglePref = (k: keyof Prefs) => {
    const next = { ...prefs, [k]: !prefs[k] }
    save('hiit.prefs', next)
    setPrefs(next)
  }

  const prepRem = showPrep ? cur.dur - (run.status === 'running' ? run.acc + now - run.t0 : run.acc) / 1000 : 0
  const nextP = phases[run.idx + 1]

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}>
      {screen === 'timer' ? (
        <TimerScreen cfg={cfg} phases={phases} run={run} now={now} onPrimary={primary} onStop={stop} onSkip={skip} onSettings={openSettings} />
      ) : (
        <SettingsScreen cfg={cfg} prefs={prefs} total={total} onBack={() => setScreen('timer')} onEdit={setSheet} onToggle={togglePref} />
      )}

      {showPrep && (
        <PrepOverlay
          number={Math.max(1, Math.ceil(prepRem - 0.001))}
          next={nextP ? `Em seguida — ${TITLES[nextP.type]}, ${dur(nextP.dur)}` : ''}
          primaryLabel={run.status === 'running' ? 'Pausar' : 'Retomar'}
          onCancel={stop}
          onPrimary={primary}
        />
      )}

      <WheelSheet field={sheet} value={sheet ? cfg[sheet] : 0} onCancel={() => setSheet(null)} onConfirm={confirmSheet} />
    </div>
  )
}
