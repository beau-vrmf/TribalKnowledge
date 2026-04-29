import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBlock, isTerminal } from '../data/fi-tree'
import { currentStep, useSession } from '../store/session'
import { archiveSession } from '../db/sessions'
import { Timer } from '../components/Timer'
import { NoteDialog } from '../components/NoteDialog'
import { CameraCapture } from '../components/CameraCapture'

export function Session() {
  const navigate = useNavigate()
  const active = useSession((s) => s.active)
  const answer = useSession((s) => s.answer)
  const completeTerminal = useSession((s) => s.completeTerminal)
  const setNote = useSession((s) => s.setNoteOnCurrent)
  const addPhoto = useSession((s) => s.addPhotoToCurrent)
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

  const step = currentStep(active)
  const photoCount = step?.photoIds.length ?? 0

  const onAnswer = async (ans: 'yes' | 'no') => {
    const next = ans === 'yes' ? block.onYes : block.onNo
    pause()
    answer(block.id, ans, next)
    if (typeof next !== 'string') {
      const snapshot = useSession.getState().active
      if (snapshot) await archiveSession(snapshot)
      navigate('/outcome', { replace: true })
    } else {
      resume()
    }
  }

  const onMarkComplete = async () => {
    pause()
    const kind = block.terminalKind ?? 'resolved'
    completeTerminal(block.id, { kind, message: block.text })
    const snapshot = useSession.getState().active
    if (snapshot) await archiveSession(snapshot)
    navigate('/outcome', { replace: true })
  }

  const terminal = isTerminal(block)

  return (
    <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto">
      <div className="sticky top-0 bg-slate-950/95 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wide text-slate-400">
            Fault {active.faultCode} · Fig {block.figure} · Sheet {block.sheet}
          </span>
          <span className="text-base font-semibold">Block {block.blockNumber}</span>
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
        <p className="text-base leading-relaxed text-slate-100 whitespace-pre-wrap">
          {block.text}
        </p>
        {block.cautions && block.cautions.length > 0 && (
          <div className="bg-rose-900/30 border-l-4 border-rose-500 rounded-r-md p-3">
            <p className="text-xs uppercase font-semibold text-rose-300 mb-1">Caution</p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-rose-100">
              {block.cautions.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}
        {block.sheetNotes && block.sheetNotes.length > 0 && (
          <div className="bg-amber-900/30 border-l-4 border-amber-500 rounded-r-md p-3">
            <p className="text-xs uppercase font-semibold text-amber-300 mb-1">Note</p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-amber-100">
              {block.sheetNotes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </div>
        )}
        {block.stub && (
          <div className="bg-slate-800 border border-slate-600 rounded-md p-3 text-sm text-slate-300">
            ⚠ This sheet has not yet been authored in the app. Tap “Mark fix complete” below
            to record the escalation, or back out and reference the original Technical Order.
          </div>
        )}

        <div className="flex gap-3 mt-2">
          <button
            onClick={() => setNoteOpen(true)}
            className="flex-1 px-4 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium"
          >
            ✎ {step?.note ? 'Edit note' : 'Add note'}
          </button>
          <CameraCapture onCaptured={(id) => addPhoto(id)} />
        </div>

        {step?.note && (
          <div className="border-l-2 border-slate-600 pl-3">
            <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
              Note for this block
            </p>
            <p className="text-sm italic text-slate-200">{step.note}</p>
          </div>
        )}

        {photoCount > 0 && (
          <p className="text-xs text-slate-400">
            📷 {photoCount} photo{photoCount === 1 ? '' : 's'} attached to this block
          </p>
        )}
      </div>

      <div className="sticky bottom-0 bg-slate-950/95 backdrop-blur border-t border-slate-800 px-4 py-4">
        {terminal ? (
          <button
            onClick={onMarkComplete}
            className={`w-full py-6 rounded-xl text-white text-2xl font-bold shadow-lg ${
              block.terminalKind === 'escalate'
                ? 'bg-amber-700 hover:bg-amber-600'
                : 'bg-emerald-700 hover:bg-emerald-600'
            }`}
          >
            {block.terminalKind === 'escalate' ? 'Acknowledge & escalate' : 'Mark fix complete'}
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-3">
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
        )}
      </div>

      <NoteDialog
        open={noteOpen}
        initial={step?.note}
        onClose={() => setNoteOpen(false)}
        onSave={(note) => setNote(note)}
      />
    </div>
  )
}
