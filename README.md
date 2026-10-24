# Cronômetro HIIT

Cronômetro de treino intervalado (PWA) para instalar no iPhone pelo Safari → Compartilhar → Adicionar à Tela de Início.

App: https://amkimura2011.github.io/cronometro-hiit/

## Rodar localmente

```bash
npm install
npm run dev
```

## Publicar

Todo push na `main` roda o workflow `.github/workflows/deploy.yml`, que gera o build e publica no GitHub Pages. No iPhone o app se atualiza sozinho na próxima abertura com internet.

## Estrutura

- `src/hiit.ts`: configuração, sequência de fases e formatação
- `src/useHiitTimer.ts`: timer baseado em timestamp, bipes e wake lock
- `src/audio.ts`: Web Audio (bipes, arpejo final, aplausos)
- `src/TimerScreen.tsx`, `PrepOverlay.tsx`, `SettingsScreen.tsx`, `WheelSheet.tsx`: telas
- `src/classical.css`: design system Classical (tokens e botões)
- `design/`: handoff original do Claude Design (especificação e protótipo)

## Limitação

Com a tela bloqueada o iOS suspende o app: o tempo continua certo, mas os bipes não tocam. Por isso o app mantém a tela acesa durante o treino.
