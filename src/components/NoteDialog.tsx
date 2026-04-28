import { useEffect, useState } from 'react'

type Props = {
  open: boolean
  initial?: string
  onClose: () => void
  onSave: (note: string) => void
}

export function NoteDialog({ open, initial, onClose, onSave }: Props) {
  const [value, setValue] = useState(initial ?? '')
  useEffect(() => {
    if (open) setValue(initial ?? '')
  }, [open, initial])

  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-40 bg-black/70 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col gap-3"
      >
        <h2 className="text-lg font-semibold">Add note</h2>
        <textarea
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={5}
          placeholder="What did you observe? Alternative fix? Gotcha?"
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(value.trim())
              onClose()
            }}
            disabled={!value.trim()}
            className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
