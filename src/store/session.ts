import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Outcome } from '../data/fi-tree'

export type StepRecord = {
  blockId: string
  answer: 'yes' | 'no'
  at: number
  note?: string
  photoId?: string // IndexedDB key
}

export type ActiveSession = {
  id: string
  faultCode: string
  entryBlockId: string
  currentBlockId: string
  startedAt: number
  elapsedMs: number // accumulated while paused
  resumedAt: number | null // timestamp when timer last started, null if paused
  steps: StepRecord[]
  outcome: Outcome | null
}

type SessionState = {
  active: ActiveSession | null
  startSession: (faultCode: string, entryBlockId: string) => void
  answer: (blockId: string, answer: 'yes' | 'no', next: string | Outcome) => void
  addNoteToStep: (index: number, note: string) => void
  attachPhotoToStep: (index: number, photoId: string) => void
  pause: () => void
  resume: () => void
  finish: () => void
  clear: () => void
}

export const useSession = create<SessionState>()(
  persist(
    (set, get) => ({
      active: null,
      startSession: (faultCode, entryBlockId) => {
        const now = Date.now()
        set({
          active: {
            id: crypto.randomUUID(),
            faultCode,
            entryBlockId,
            currentBlockId: entryBlockId,
            startedAt: now,
            elapsedMs: 0,
            resumedAt: now,
            steps: [],
            outcome: null,
          },
        })
      },
      answer: (blockId, answer, next) => {
        const a = get().active
        if (!a) return
        const step: StepRecord = { blockId, answer, at: Date.now() }
        if (typeof next === 'string') {
          set({ active: { ...a, steps: [...a.steps, step], currentBlockId: next } })
        } else {
          set({ active: { ...a, steps: [...a.steps, step], outcome: next } })
        }
      },
      addNoteToStep: (index, note) => {
        const a = get().active
        if (!a) return
        const steps = a.steps.map((s, i) => (i === index ? { ...s, note } : s))
        set({ active: { ...a, steps } })
      },
      attachPhotoToStep: (index, photoId) => {
        const a = get().active
        if (!a) return
        const steps = a.steps.map((s, i) => (i === index ? { ...s, photoId } : s))
        set({ active: { ...a, steps } })
      },
      pause: () => {
        const a = get().active
        if (!a || a.resumedAt === null) return
        const delta = Date.now() - a.resumedAt
        set({ active: { ...a, elapsedMs: a.elapsedMs + delta, resumedAt: null } })
      },
      resume: () => {
        const a = get().active
        if (!a || a.resumedAt !== null) return
        set({ active: { ...a, resumedAt: Date.now() } })
      },
      finish: () => set({ active: null }),
      clear: () => set({ active: null }),
    }),
    {
      name: 'tk-active-session',
      version: 1,
    },
  ),
)

export function totalElapsedMs(a: ActiveSession): number {
  const running = a.resumedAt ? Date.now() - a.resumedAt : 0
  return a.elapsedMs + running
}
