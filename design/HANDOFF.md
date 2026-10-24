# Handoff: Cronômetro HIIT (PWA para iPhone)

## Overview
Cronômetro de treino intervalado de alta intensidade. O usuário define duração da série, recuperação entre séries, número de séries, ciclos, intervalo entre ciclos e contagem regressiva inicial. Ao iniciar, há uma contagem regressiva em tela cheia e depois o cronômetro alterna as fases com dois anéis de progresso, bipes e uma fanfarra + aplausos ao final. Deve ser instalável no iPhone (Adicionar à Tela de Início).

## About the Design Files
`Cronometro HIIT.dc.html` é uma **referência de design em HTML** — um protótipo funcional mostrando aparência e comportamento pretendidos. Ele roda sobre um runtime de prototipagem (`support.js`) que não deve ir para produção. A tarefa é **recriar este design num projeto real**. Como não existe codebase ainda, a recomendação é: **Vite + React + TypeScript** como PWA (plugin `vite-plugin-pwa`), mantendo o CSS do design system (`_ds/.../styles.css`). Opcional depois: empacotar com **Capacitor** para App Store e notificações locais.

A lógica de timer (classe `Component` no `<script data-dc-script>` do arquivo) é JS puro e pode ser portada quase literalmente para um hook `useHiitTimer`.

## Fidelity
**High-fidelity.** Cores, tipografia, espaçamentos e interações são finais. Recriar fielmente.

## Screens / Views

### 1. Cronômetro (tela principal)
- **Container**: coluna flex, `max-width: 460px`, centralizada, `min-height: 100dvh`. Padding: `env(safe-area-inset-top)+20px` topo, 24px laterais, `env(safe-area-inset-bottom)+24px` base.
- **Cabeçalho** (centralizado, gap 6px):
  - Kicker: Lora 11px, uppercase, letter-spacing 0.18em, cor `--color-accent-700` (#7d5411). Textos: idle "Cronômetro intervalado"; prep "Contagem regressiva"; ativo "Ciclo {c} · Série {s}"; pausado "Em pausa"; fim "Treino concluído".
  - Título: Cormorant Garamond 42px, peso 400, line-height 1.05. Textos: "Pronto" / "Preparar" / "Exercício" / "Recuperação" / "Intervalo entre ciclos" / "Concluído".
- **Faixa de status**: margin-top 20px, padding 14px 0, hairlines topo e base (`--color-divider`). Grid `1fr 1px 1fr`; divisor vertical 36px de altura. Cada lado: número Cormorant 30px tabular ("1/8", "—/8") + rótulo Lora 11px uppercase 0.14em `--color-neutral-700` ("Séries", "Ciclos").
- **Anéis** (flex:1, centralizado): quadrado `width: min(84vw, 46dvh, 360px)`. SVG viewBox 320×320, centro 160,160, início no topo (rotate -90°), extremidades arredondadas:
  - 60 marcas de minuto entre r=131/135 e r=141; a cada 5ª mais longa (stroke 1.2), demais 0.6; cor `--color-neutral-400`.
  - Anel externo: trilho r=152 stroke 1 `--color-divider`; progresso r=152 **stroke 7** `--color-text` (#201f1d). Representa o tempo restante do treino (tweak opcional: do ciclo atual).
  - Anel interno: trilho r=122 stroke 1; progresso r=122 stroke 7, cor por fase: exercício/prep `--color-accent` #b68235, recuperação `--color-neutral-500` #9b9797, intervalo entre ciclos `--color-accent-700` #7d5411. Representa o tempo restante da fase.
  - Ambos diminuem (dashoffset = circunferência × (1 − restante/total)), atualizados a cada 100ms.
  - Centro (sobreposto): ícone Lucide 22px `--color-neutral-600` (timer / dumbbell / heart / hourglass conforme a fase); número grande Cormorant 400 tabular, `clamp(80px,26vw,124px)` em execução (segundos restantes, 2 dígitos) ou `clamp(56px,17vw,80px)` em idle (tempo total mm:ss) / fim ("Fim"); abaixo, Lora 19px tabular `--color-neutral-800` (tempo total restante mm:ss) + rótulo 10px uppercase 0.16em ("restante", "séries × ciclos", "de treino").
- **Linha "A seguir"**: Lora itálico 15px `--color-neutral-700`, centralizada, margem inferior 20px. "A seguir — Recuperação, 15 s" / "Último trecho" / idle: "45 s de esforço, 15 s de recuperação" / fim: "Bom trabalho."
- **Controles** (flex, gap 28px):
  - Parar: círculo 68px, borda 1px `--color-divider`, ícone square. Desabilitado (opacity .45) em idle.
  - Principal: círculo 108px, borda 1px `--color-accent`, texto Cormorant 600 22px `--color-accent-700`, anel externo duplo via `box-shadow: 0 0 0 5px var(--color-bg), 0 0 0 6px var(--color-divider)`. Rótulo: Iniciar / Pausar / Retomar / Recomeçar.
  - Direita: em idle/fim → Configurações (ícone settings-2); em execução/pausa → Pular (ícone skip-forward). Mesmo estilo do Parar.
  - Pressed: fundo `color-mix(accent 22%)` no principal, `color-mix(text 10%)` nos demais.

### 2. Contagem regressiva (overlay em tela cheia)
Aparece durante a fase `prep`. `position: fixed; inset: 0`, fundo `--color-bg`. Centro: kicker "Prepare-se" (12px, 0.22em, accent-700), numeral Cormorant 400 `min(70vw,44dvh)` cor `--color-accent`, filete 48×1px accent, linha itálica "Em seguida — Exercício, 45 s". Base: botões `.btn.btn-secondary` "Cancelar" e `.btn.btn-primary` (Pausar/Retomar), 48px de altura, min-width 120px, 17px.

### 3. Configurações
- Botão voltar `.btn-ghost` com chevron-left + "Cronômetro" (44px).
- Título "Configurações" Cormorant 44px 400; resumo itálico `--color-neutral-700`: "4 ciclos de 8 séries: 45 s de esforço e 15 s de recuperação, com 1 min 30 s entre ciclos."
- Seções com kicker (11px uppercase 0.18em accent-700): **Tempos** (Contagem regressiva; Exercício · por série; Recuperação · entre séries; Intervalo entre ciclos), **Estrutura** (Séries · por ciclo; Ciclos), **Preferências** (Sinais sonoros; Manter tela acesa).
- Cada grupo: borda 1px `--color-divider`, radius `--radius-lg` (7px). Linhas: grid `24px 1fr auto 16px`, gap 14px, min-height 56px, padding 0 16px, hairline entre linhas. Ícone Lucide 22px, rótulo Lora 16px (sufixo itálico 14px neutral-700), valor 15px tabular neutral-700, chevron-right 16px neutral-500. Pressed: `color-mix(accent 10%)`.
- Toggle: pílula 46×28, borda 1px; bolinha 18px. Ligado: borda e bolinha `--color-accent`, translateX 18px; desligado: `--color-neutral-400`. Transição .2s.
- Rodapé: hairline topo, "Tempo total do treino" (11px uppercase) + valor Cormorant 30px tabular (mm:ss).

### 4. Bottom sheet de seleção (roda)
- Backdrop `color-mix(neutral-900 35%)`, fade .25s. Sheet fixa na base, max-width 460px, fundo bg, borda topo hairline, radius 7px no topo, `--shadow-lg`, slide `translateY(110%)→0` em .3s `cubic-bezier(.2,.8,.2,1)`.
- Alça 36×1px neutral-500; kicker (ex. "Duração de cada série") + título Cormorant 32px.
- Rodas: colunas de 220px de altura, itens de 44px, scroll-snap, padding vertical 88px, máscara em degradê nas bordas; faixa de seleção marcada por 2 filetes accent. Item: número Cormorant 28px + unidade Lora 13px; opacidade `max(.15, 1 − 0.28·distância)`.
  - Tempo: colunas "min" (0–59) e "s" (0–59). Exercício mínimo 1 s.
  - Séries: 1–30; Ciclos: 1–20.
- Botões "Cancelar" (`.btn-secondary`) e "Definir" (`.btn-primary`), flex 1, 48px.

## Interactions & Behavior
- **Sequência de fases**: `prep` (se contagem > 0) → para cada ciclo: `work` e `rest` alternados (sem `rest` após a última série do ciclo) → `interval` entre ciclos (não após o último).
- **Timer baseado em timestamp** (`Date.now()`), não em contagem de ticks: `elapsed = acc + (now − t0)`. Ao voltar do segundo plano, o laço avança todas as fases vencidas.
- Pausar: `acc += now − t0`. Retomar: `t0 = now`. Pular: próxima fase, zera acc. Parar: volta a idle. Alterar configurações reseta para idle.
- **Áudio** (Web Audio, desbloqueado no toque em Iniciar — exigência do iOS):
  - Início de exercício: senoide 1046 Hz, 0.5 s. Início de recuperação/intervalo/prep: 523 Hz, 0.45 s.
  - Últimos 3 s de cada fase (se dur > 3): 880 Hz, 0.12 s por segundo.
  - Fim: arpejo 523/659/784/1046 Hz (150 ms entre notas, última 0.9 s), depois `sounds/aplausos.mp3` em 0.7 s, máx. 5 s com fade-out no último segundo.
  - Envelope: ganho 0.0001 → 0.35 em 10 ms → 0.0001 exponencial.
- **Wake Lock** (`navigator.wakeLock.request('screen')`) enquanto roda; liberar em pausa/fim; reaquirir em `visibilitychange`.
- **Limitação iOS**: em segundo plano o JS é suspenso — tempo continua correto, mas bipes não tocam. Para alertas com tela bloqueada, usar Capacitor + Local Notifications agendadas no início.

## State Management
- `cfg`: `{ countdown: 10, work: 45, rest: 15, series: 8, cycles: 4, cycleRest: 90 }` (segundos/contagens) — persistido em `localStorage['hiit.cfg']`.
- `prefs`: `{ sound: true, wake: true }` — `localStorage['hiit.prefs']`.
- `run`: `{ status: 'idle'|'running'|'paused'|'done', idx, acc, t0 }`.
- `screen`: `'timer'|'settings'`; `sheet`: chave em edição ou null; `sheetVals`: índices das rodas.
- Tweaks do protótipo (viram constantes/config): `outerRing: 'treino'|'ciclo'`, `prepFullscreen: true`, `showNext: true`.

## Design Tokens (Classical)
- Fundo `#f3f2f2`, superfície `#eae9e9`, texto `#201f1d`, divisor `rgba(32,31,29,.16)`.
- Accent `#b68235`; ramp 100 `#fff3e4` · 300 `#facb8d` · 400 `#e1ad66` · 500 `#c28d41` · 600 `#a06f24` · 700 `#7d5411` · 800 `#5a3b0a`.
- Neutral 400 `#bab6b6` · 500 `#9b9797` · 600 `#7d7979` · 700 `#605d5d` · 800 `#444141` · 900 `#2d2b2b`.
- Fontes: Cormorant Garamond (400/600) para títulos e numerais; Lora (400/600) para corpo. Google Fonts. Numerais sempre `font-variant-numeric: tabular-nums`.
- Espaçamento: 4.6 / 9.2 / 13.8 / 18.4 / 27.6 / 36.8 px. Radius 2 / 4 / 7 px.
- Sombra lg: `0 12px 32px rgba(45,43,43,.22)`.
- Botões sempre contornados (nunca preenchidos). Foco: `outline 2px solid accent, offset 2px`.

## Assets
- Ícones: **Lucide** (timer, dumbbell, heart, hourglass, layers, repeat, volume-2, sun, settings-2, square, skip-forward, chevron-left/right). Usar `lucide-react`.
- `icons/apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png` — ícone do app.
- `sounds/aplausos.mp3` — aplausos fornecidos pelo usuário.

## PWA / Instalação no iPhone
- `manifest.webmanifest`: name "Cronômetro HIIT", short_name "HIIT", display standalone, orientation portrait, theme/background `#f3f2f2`.
- Meta tags: `viewport-fit=cover, user-scalable=no`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-title="HIIT"`, `apple-touch-icon`.
- `sw.js`: network-first com fallback de cache (offline).
- Publicar em HTTPS (Vercel, Netlify ou GitHub Pages) → abrir no Safari → Compartilhar → Adicionar à Tela de Início.

## Files
- `Cronometro HIIT.dc.html` — protótipo completo (template + lógica). Abra num servidor local (`npx serve .`) para ver funcionando.
- `support.js` — runtime do protótipo (apenas referência, não portar).
- `_ds/.../styles.css` — tokens e classes do design system Classical (reutilizar).
- `manifest.webmanifest`, `sw.js`, `icons/`, `sounds/`.
