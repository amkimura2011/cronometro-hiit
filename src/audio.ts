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
