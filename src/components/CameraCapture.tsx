import { useRef } from 'react'
import { savePhoto } from '../db/sessions'

type Props = {
  onCaptured: (photoId: string) => void
}

export function CameraCapture({ onCaptured }: Props) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <>
      <button
        onClick={() => ref.current?.click()}
        className="px-4 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium"
      >
        📷 Photo
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0]
          if (!file) return
          const id = await savePhoto(file)
          onCaptured(id)
          e.target.value = ''
        }}
      />
    </>
  )
}
