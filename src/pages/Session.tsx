import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBlock } from '../data/fi-tree'
import { useSession } from '../store/session'
import { archiveSession } from '../db/sessions'
import { Timer } from '../components/Timer'
import { NoteDialog } from '../components/NoteDialog'
import { CameraCapture } from '../components/CameraCapture'

export function Session() {
  const navigate = useNavigate()
  const active = useSession((s) => s.active)
  const answer = useSession((s) => s.answer)
  const addNote = useSession((s) => s.addNoteToStep)
  const attachPhoto = useSession((s) => s.attachPhotoToStep)
  const pause = useSession((s) => s.pause)
  const resume = useSession((s) => s.resume)

  const [noteOpen, setNoteOpen] = useState(false)

  useEffect(() => {
    if (!active) {
      navigate('/', { replace: true })
      return
    }
    if (active.outcome) {
      navigate('/outcome', { replace: true })
      return
    }
    if (active.resumedAt === null) resume()
  }, [active?.id, active?.outcome, active?.resumedAt])

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) pause()
      else resume()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [pause, resume])

  if (!active) return null
  const block = getBlock(active.currentBlockId)
  if (!block) {
    return (
      <div className="p-6 text-center">
        <p className="text-lg">Unknown block {active.currentBlockId}.</p>
        <button
          className="mt-4 px-4 py-2 bg-brand-600 rounded-lg"
          onClick={() => navigate('/', { replace: true })}
        >
          Back to fault codes
        </button>
      </div>
    )
  }

  const onAnswer = async (ans: 'yes' | 'no') => {
    const next = ans === 'yes' ? block.onYes : block.onNo
    pause()
    answer(block.id, ans, next)
    if (typeof next !== 'string') {
      // Terminal: archive a snapshot then go to outcome.
      const snapshot = useSession.getState().active
      if (snapshot) await archiveSession(snapshot)
      navigate('/outcome', { replace: true })
    } else {
      resume()
    }
  }

  const lastStepIndex = active.steps.length - 1
  const lastStep = lastStepIndex >= 0 ? active.steps[lastStepIndex] : null

  return (
    <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto">
      <div className="sticky top-0 bg-slate-950/95 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wide text-slate-400">
            Fault {active.faultCode} · Fig {block.figure}
          </span>
          <span className="text-base font-semibold">Block {block.id}</span>
        </div>
        <Timer />
        <button
          onClick={() => {
            pause()
            navigate('/', { replace: true })
          }}
          className="text-sm text-slate-300 hover:text-white px-3 py-1.5 rounded-md hover:bg-slate-800"
        >
          Pause & exit
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-4 px-4 py-5">
        <h1 className="text-xl font-semibold">{block.title}</h1>
        <p className="text-base leading-relaxed text-slate-100 whitespace-pre-wrap">
          {block.question}
        </p>
        {block.notes && block.notes.length > 0 && (
          <div className="bg-amber-900/30 border-l-4 border-amber-500 rounded-r-md p-3">
            <p className="text-xs uppercase font-semibold text-amber-300 mb-1">Note</p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-amber-100">
              {block.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-3 mt-2">
          <button
            onClick={() => setNoteOpen(true)}
            className="flex-1 px-4 py-3 rounded-lg bg-slate-700 hover:bg-slate-600"
            disabled={lastStepIndex < 0}
          >
            ✎ Add note{lastStep?.note ? ' (edit)' : ''}
          </button>
          {lastStepIndex >= 0 && (
            <CameraCapture onCaptured={(id) => attachPhoto(lastStepIndex, id)} />
          )}
        </div>
        {lastStep?.note && (
          <p className="text-sm text-slate-300 italic border-l-2 border-slate-600 pl-3">
            Prev step note: {lastStep.note}
          </p>
        )}
      </div>

      <div className="sticky bottom-0 bg-slate-950/95 backdrop-blur border-t border-slate-800 px-4 py-4 grid grid-cols-2 gap-3">
        <button
          onClick={() => onAnswer('no')}
          className="py-6 rounded-xl bg-rose-700 hover:bg-rose-600 text-white text-2xl font-bold shadow-lg"
        >
          NO
        </button>
        <button
          onClick={() => onAnswer('yes')}
          className="py-6 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-2xl font-bold shadow-lg"
        >
          YES
        </button>
      </div>

      <NoteDialog
        open={noteOpen}
        initial={lastStep?.note}
        onClose={() => setNoteOpen(false)}
        onSave={(note) => lastStepIndex >= 0 && addNote(lastStepIndex, note)}
      />
    </div>
  )
}
