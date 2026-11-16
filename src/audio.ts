// Sinais sonoros via Web Audio. No iOS o contexto só destrava dentro de um toque,
// por isso unlock() é chamado no botão Iniciar/Pausar e em qualquer toque quando o som cai.

let ac: AudioContext | null = null
let applause: AudioBuffer | null = null
let applauseLoading = false

// true quando o som caiu e só um toque consegue religar (o iOS exige gesto)
let needsTouch = false
const listeners = new Set<(muted: boolean) => void>()
function setNeedsTouch(v: boolean) {
  if (needsTouch === v) return
  needsTouch = v
  listeners.forEach((f) => f(v))
}

const APPLAUSE_URL = `${import.meta.env.BASE_URL}sounds/aplausos.mp3`

function newContext(): AudioContext | null {
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  return AC ? new AC() : null
}

// Chamado dentro de um toque. Se o som caiu, troca por um contexto novo: o iOS às vezes
// deixa o antigo "running" e mudo depois de outro app usar o áudio, e resume() não o recupera.
export function unlock() {
  if (!ac || needsTouch) {
    void ac?.close().catch(() => {})
    ac = newContext()
  }
  // 'interrupted' é estado próprio do iOS (outro app tomou o áudio), além de 'suspended'
  if (ac && ac.state !== 'running') void ac.resume().catch(() => {})
  setNeedsTouch(false)
  loadApplause()
}

// Ao voltar de outro app: tenta religar sem toque, com um contexto novo.
// Se o iOS não deixar (contexto novo não sobe sem gesto), fica com o antigo e pede um toque.
function revive() {
  if (!ac) return
  const old = ac
  if (old.state !== 'running') void old.resume().catch(() => {})
  const fresh = newContext()
  if (!fresh) return
  void fresh.resume().catch(() => {})
  setTimeout(() => {
    if (ac !== old) return void fresh.close().catch(() => {}) // um toque já trocou o contexto
    if (fresh.state === 'running') {
      ac = fresh
      void old.close().catch(() => {})
      setNeedsTouch(false)
    } else {
      void fresh.close().catch(() => {})
      setNeedsTouch(true)
    }
  }, 300)
}

// Liga a recuperação automática. Devolve a função de desligar.
export function watchAudio(onMuted: (muted: boolean) => void) {
  const onVis = () => {
    if (document.visibilityState === 'visible') revive()
  }
  const onTouch = () => {
    if (needsTouch || (ac && ac.state !== 'running')) unlock()
  }
  listeners.add(onMuted)
  document.addEventListener('visibilitychange', onVis)
  window.addEventListener('pageshow', onVis)
  document.addEventListener('pointerdown', onTouch, true)
  return () => {
    listeners.delete(onMuted)
    document.removeEventListener('visibilitychange', onVis)
    window.removeEventListener('pageshow', onVis)
    document.removeEventListener('pointerdown', onTouch, true)
  }
}

function loadApplause() {
  if (applauseLoading || !ac) return
  applauseLoading = true
  const ctx = ac
  fetch(APPLAUSE_URL)
    .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
    .then((b) => ctx.decodeAudioData(b))
    .then((buf) => {
      applause = buf
    })
    .catch(() => {
      applauseLoading = false
    })
}

// Bipes em onda quadrada, sustentados no volume quase máximo: a senoide de 0,35 que
// decaía logo após o ataque ficava ~24 dB abaixo do máximo e sumia no alto-falante do iPhone.
// Frequências na faixa de 1–2 kHz, onde o alto-falante do celular rende e o ouvido é mais sensível.
const PEAK = 0.8

export const TONE = {
  work: [2093, 0.6], // início do exercício (dó 7)
  rest: [1046, 0.55], // início de recuperação, intervalo e contagem (dó 6)
  tick: [1760, 0.15], // últimos 3 s de cada fase (lá 6)
} as const

export function beep(freq: number, len: number) {
  if (!ac) return
  if (ac.state !== 'running') void ac.resume().catch(() => {})
  const t = ac.currentTime
  const o = ac.createOscillator()
  const g = ac.createGain()
  o.type = 'square'
  o.frequency.value = freq
  // ataque de 5 ms, sustenta no pico, solta em 40 ms (evita estalo)
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(PEAK, t + 0.005)
  g.gain.setValueAtTime(PEAK, t + len - 0.04)
  g.gain.linearRampToValueAtTime(0, t + len)
  o.connect(g).connect(ac.destination)
  o.start(t)
  o.stop(t + len + 0.02)
}

// arpejo ascendente + aplausos (máx. 5 s, fade-out no último segundo).
// Notas curtas que não se sobrepõem e aplausos só depois da última nota, para a soma não estourar.
export function celebrate() {
  if (!ac) return
  ;[1046, 1319, 1568, 2093].forEach((f, i) => setTimeout(() => beep(f, i === 3 ? 0.9 : 0.14), i * 150))
  if (!applause) return
  const s = ac.createBufferSource()
  const g = ac.createGain()
  const at = ac.currentTime + 1.4
  const len = Math.min(applause.duration, 5)
  s.buffer = applause
  g.gain.setValueAtTime(1, at)
  g.gain.setValueAtTime(1, at + len - 1)
  g.gain.linearRampToValueAtTime(0.0001, at + len)
  s.connect(g).connect(ac.destination)
  s.start(at)
  s.stop(at + len + 0.05)
}
