import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { totalElapsedMs, useSession } from '../store/session'
import { getBlock } from '../data/fi-tree'

function fmtDuration(ms: number): string {
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return h > 0 ? `${h}h ${m}m ${sec}s` : `${m}m ${sec}s`
}

export function Outcome() {
  const navigate = useNavigate()
  const active = useSession((s) => s.active)
  const finish = useSession((s) => s.finish)

  useEffect(() => {
    if (!active) navigate('/', { replace: true })
  }, [active])

  if (!active || !active.outcome) return null
  const resolved = active.outcome.kind === 'resolved'

  return (
    <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto px-4 py-6 gap-6">
      <div
        className={`rounded-xl p-5 border ${
          resolved
            ? 'bg-emerald-900/30 border-emerald-600'
            : 'bg-amber-900/30 border-amber-600'
        }`}
      >
        <p className="text-xs uppercase tracking-wider opacity-80">
          {resolved ? 'Resolved' : 'Escalate'}
        </p>
        <h1 className="text-2xl font-semibold mt-1">{active.outcome.message}</h1>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-slate-800 rounded-lg p-3">
          <dt className="text-slate-400">Fault code</dt>
          <dd className="font-mono text-lg">{active.faultCode}</dd>
        </div>
        <div className="bg-slate-800 rounded-lg p-3">
          <dt className="text-slate-400">Duration</dt>
          <dd className="text-lg">{fmtDuration(totalElapsedMs(active))}</dd>
        </div>
      </dl>

      <section>
        <h2 className="text-lg font-semibold mb-2">Path walked</h2>
        <ol className="space-y-2">
          {active.steps.map((step, i) => {
            const b = getBlock(step.blockId)
            return (
              <li key={i} className="bg-slate-800 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-slate-300">Block {step.blockId}</span>
                  {step.answer && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        step.answer === 'yes'
                          ? 'bg-emerald-700 text-emerald-50'
                          : 'bg-rose-700 text-rose-50'
                      }`}
                    >
                      {step.answer.toUpperCase()}
                    </span>
                  )}
                </div>
                {b && <p className="text-sm text-slate-300 mt-1">{b.title}</p>}
                {step.note && (
                  <p className="text-sm italic text-slate-200 mt-2 border-l-2 border-slate-600 pl-3">
                    {step.note}
                  </p>
                )}
                {step.photoIds.length > 0 && (
                  <p className="text-xs text-slate-400 mt-1">
                    📷 {step.photoIds.length} photo{step.photoIds.length === 1 ? '' : 's'} attached
                  </p>
                )}
              </li>
            )
          })}
        </ol>
      </section>

      <button
        onClick={() => {
          finish()
          navigate('/', { replace: true })
        }}
        className="mt-2 w-full bg-brand-600 hover:bg-brand-500 text-white text-lg font-semibold py-4 rounded-lg"
      >
        Done — new session
      </button>
    </div>
  )
}
