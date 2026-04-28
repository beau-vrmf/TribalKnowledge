# Tribal Knowledge

A Progressive Web App (PWA) prototype for aircraft maintenance Fault Isolation (FI) troubleshooting — replacing paper-based Technical Order flowcharts (e.g. `TO 1C-130H-2-61FI-00-1`, C-130 propeller system) with a guided, offline-capable tablet experience.

## Phase 1 scope

- Fault-code lookup (search)
- Guided YES/NO decision-tree walking
- Session timer (auto-pause on backgrounding)
- Per-step notes
- Camera capture (stored offline in IndexedDB)
- Session history
- Fully offline after first load, installable to home screen

Seed data covers fault code **6110004** (flight idle torque spread) end-to-end via Figure 2-4 blocks 47 → 54/57/58. Other codes are stubbed ("not yet authored") — add more to `src/data/fi-tree.ts`.

## Development

```bash
npm install
npm run dev       # http://localhost:5173
npm run test      # vitest
npm run build     # production build into dist/
npm run preview   # serve the built dist/
```

## Install to home screen

1. `npm run build && npm run preview`
2. Open the preview URL in Chrome/Edge on desktop or mobile
3. Use the install prompt (address bar icon on desktop; "Add to Home Screen" in the browser menu on iOS/Android)

## Offline smoke test

1. Build + preview (or run `dev` once to register the SW)
2. DevTools → Application → Service Workers — confirm registered
3. DevTools → Network → Offline, reload — app should still load and resume an active session

## Project layout

```
src/
  data/fi-tree.ts       hand-authored FI blocks & fault codes
  store/session.ts      Zustand store, persisted to localStorage
  db/sessions.ts        IndexedDB (photos + archived sessions)
  pages/                FaultCodeList, Session, Outcome, History
  components/           Timer, NoteDialog, CameraCapture
  __tests__/            Vitest tree-navigation tests
```

## Roadmap (post-Phase 1)

- Backend + auth for cross-device session sync
- Admin UI to author FI trees without editing code
- AI-assisted root-cause recommendations from aggregated sessions
- Voice-to-text for notes (gloved-hands use case)
- Offline document/PDF import for new Technical Orders
