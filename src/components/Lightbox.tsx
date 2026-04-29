import { useEffect, useState } from 'react'

type Props = {
  src: string
  alt: string
  open: boolean
  onClose: () => void
}

/**
 * Fullscreen image viewer with pinch-to-zoom (native via touch-action) and
 * tap-to-toggle 1x/2x. Closes on backdrop tap, X button, or Escape.
 * Falls back gracefully if the image is missing — shows a placeholder card
 * instead of a broken icon, so blocks without an authored sheet image don't
 * confuse the technician.
 */
export function Lightbox({ src, alt, open, onClose }: Props) {
  const [zoomed, setZoomed] = useState(false)
  const [errored, setErrored] = useState(false)

  useEffect(() => {
    if (!open) return
    setZoomed(false)
    setErrored(false)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex flex-col"
      onClick={onClose}
    >
      <div className="flex justify-between items-center px-4 py-3 bg-black/60">
        <span className="text-sm text-slate-300 truncate">{alt}</span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          className="text-white text-xl px-3 py-1 rounded hover:bg-white/10"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div
        className="flex-1 overflow-auto flex items-center justify-center p-2"
        style={{ touchAction: 'pinch-zoom' }}
        onClick={(e) => e.stopPropagation()}
      >
        {errored ? (
          <div className="max-w-md text-center bg-slate-800 border border-slate-600 rounded-lg p-6 text-slate-200">
            <p className="text-lg font-semibold mb-2">Source image not yet bundled</p>
            <p className="text-sm text-slate-400">
              The TO source page for this block hasn't been added to the app yet.
              Reference the original Technical Order until the image is bundled.
            </p>
            <p className="text-xs text-slate-500 mt-3 font-mono">{src}</p>
          </div>
        ) : (
          <img
            src={src}
            alt={alt}
            onError={() => setErrored(true)}
            onClick={() => setZoomed((z) => !z)}
            className={`max-w-none transition-transform duration-150 select-none ${
              zoomed ? 'scale-200 cursor-zoom-out' : 'cursor-zoom-in'
            }`}
            style={{
              maxHeight: zoomed ? 'none' : '90vh',
              maxWidth: zoomed ? 'none' : '95vw',
            }}
            draggable={false}
          />
        )}
      </div>
    </div>
  )
}
