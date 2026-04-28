import { useEffect, useState } from 'react'
import { listSessions } from '../db/sessions'
import type { ActiveSession } from '../store/session'

function fmtDate(ms: number): string {
  return new Date(ms).toLocaleString()
}

function fmtDuration(ms: number): string {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}m ${sec}s`
}

export function History() {
  const [sessions, setSessions] = useState<ActiveSession[] | null>(null)

  useEffect(() => {
    listSessions().then(setSessions)
  }, [])

  if (sessions === null) {
    return <div className="p-6 text-slate-400">Loading…</div>
  }
  if (sessions.length === 0) {
    return (
      <div className="p-6 text-center text-slate-400">
        No sessions yet. Start a fault code from the home screen.
      </div>
    )
  }

  return (
    <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-4 flex flex-col gap-3">
      {sessions.map((s) => (
        <details key={s.id} className="bg-slate-800 rounded-lg border border-slate-700">
          <summary className="p-4 cursor-pointer list-none flex items-center justify-between">
            <div>
              <div className="font-mono text-brand-50">{s.faultCode}</div>
              <div className="text-xs text-slate-400">{fmtDate(s.startedAt)}</div>
            </div>
            <div className="text-right">
              <div
                className={`text-xs px-2 py-0.5 inline-block rounded ${
                  s.outcome?.kind === 'resolved'
                    ? 'bg-emerald-700'
                    : s.outcome?.kind === 'escalate'
                      ? 'bg-amber-700'
                      : 'bg-slate-600'
                }`}
              >
                {s.outcome?.kind ?? 'in progress'}
              </div>
              <div className="text-xs text-slate-400 mt-1">{fmtDuration(s.elapsedMs)}</div>
            </div>
          </summary>
          <div className="border-t border-slate-700 p-4 text-sm space-y-2">
            {s.outcome && <p className="text-slate-200">{s.outcome.message}</p>}
            <ol className="space-y-1">
              {s.steps.map((step, i) => (
                <li key={i} className="text-slate-300">
                  <span className="font-mono">block {step.blockId}</span>
                  {step.answer && (
                    <>
                      {' '}→{' '}
                      <span
                        className={step.answer === 'yes' ? 'text-emerald-400' : 'text-rose-400'}
                      >
                        {step.answer}
                      </span>
                    </>
                  )}
                  {step.note && <span className="italic text-slate-400"> — {step.note}</span>}
                  {step.photoIds.length > 0 && (
                    <span className="text-slate-500"> · 📷 {step.photoIds.length}</span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </details>
      ))}
    </div>
  )
}
