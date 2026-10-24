// Sinais sonoros via Web Audio. No iOS o contexto só destrava dentro de um toque,
// por isso unlock() é chamado no botão Iniciar/Pausar.

let ac: AudioContext | null = null
let applause: AudioBuffer | null = null
let applauseLoading = false

const APPLAUSE_URL = `${import.meta.env.BASE_URL}sounds/aplausos.mp3`

export function unlock() {
  if (!ac) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (AC) ac = new AC()
  }
  if (ac?.state === 'suspended') void ac.resume()
  loadApplause()
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

export function beep(freq: number, len: number) {
  if (!ac) return
  const t = ac.currentTime
  const o = ac.createOscillator()
  const g = ac.createGain()
  o.type = 'sine'
  o.frequency.value = freq
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(0.35, t + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t + len)
  o.connect(g).connect(ac.destination)
  o.start(t)
  o.stop(t + len + 0.05)
}

// arpejo ascendente + aplausos (máx. 5 s, fade-out no último segundo)
export function celebrate() {
  if (!ac) return
  ;[523, 659, 784, 1046].forEach((f, i) => setTimeout(() => beep(f, i === 3 ? 0.9 : 0.18), i * 150))
  if (!applause) return
  const s = ac.createBufferSource()
  const g = ac.createGain()
  const at = ac.currentTime + 0.7
  const len = Math.min(applause.duration, 5)
  s.buffer = applause
  g.gain.setValueAtTime(0.9, at)
  g.gain.setValueAtTime(0.9, at + len - 1)
  g.gain.linearRampToValueAtTime(0.0001, at + len)
  s.connect(g).connect(ac.destination)
  s.start(at)
  s.stop(at + len + 0.05)
}
