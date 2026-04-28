import { describe, expect, it, beforeEach } from 'vitest'
import { getBlock, getFaultCode } from '../data/fi-tree'
import { useSession } from '../store/session'

describe('FI tree navigation — fault 6110004', () => {
  beforeEach(() => {
    useSession.setState({ active: null })
  })

  it('has the fault code wired to block 47', () => {
    const fc = getFaultCode('6110004')
    expect(fc).toBeDefined()
    expect(fc?.entry).toBe('47')
    expect(getBlock('47')).toBeDefined()
  })

  it('starts a session with entry block as the first step', () => {
    const { startSession } = useSession.getState()
    startSession('6110004', '47')
    const a = useSession.getState().active!
    expect(a.steps).toHaveLength(1)
    expect(a.steps[0].blockId).toBe('47')
    expect(a.steps[0].answer).toBeNull()
    expect(a.currentBlockId).toBe('47')
  })

  it('walks the happy path 47 → 54 → resolved', () => {
    const { startSession, answer } = useSession.getState()
    startSession('6110004', '47')

    // Block 47: YES (RPM in spec) → block 54
    const b47 = getBlock('47')!
    answer('47', 'yes', b47.onYes)
    let a = useSession.getState().active!
    expect(a.currentBlockId).toBe('54')
    expect(a.steps).toHaveLength(2)
    expect(a.steps[0].answer).toBe('yes')
    expect(a.steps[1].blockId).toBe('54')
    expect(a.steps[1].answer).toBeNull()

    // Block 54: YES (index satisfactory) → resolved outcome
    const b54 = getBlock('54')!
    answer('54', 'yes', b54.onYes)
    a = useSession.getState().active!
    expect(a.outcome?.kind).toBe('resolved')
    // Last step gets the answer; no new step pushed on terminal
    expect(a.steps).toHaveLength(2)
    expect(a.steps[1].answer).toBe('yes')
  })

  it('walks an escalation path 47 → 57 → 58 → escalate', () => {
    const { startSession, answer } = useSession.getState()
    startSession('6110004', '47')

    answer('47', 'no', getBlock('47')!.onNo) // → 57
    expect(useSession.getState().active?.currentBlockId).toBe('57')

    answer('57', 'no', getBlock('57')!.onNo) // → 58
    expect(useSession.getState().active?.currentBlockId).toBe('58')

    answer('58', 'no', getBlock('58')!.onNo) // escalate
    const a = useSession.getState().active!
    expect(a.outcome?.kind).toBe('escalate')
    expect(a.steps.map((s) => s.blockId)).toEqual(['47', '57', '58'])
    expect(a.steps.map((s) => s.answer)).toEqual(['no', 'no', 'no'])
  })

  it('attaches notes and photos to the current block visit', () => {
    const { startSession, setNoteOnCurrent, addPhotoToCurrent, answer } = useSession.getState()
    startSession('6110004', '47')

    // Notes/photos work BEFORE answering — that was the original bug.
    setNoteOnCurrent('observed unusual vibration')
    addPhotoToCurrent('photo-id-1')
    addPhotoToCurrent('photo-id-2')

    let a = useSession.getState().active!
    expect(a.steps[0].note).toBe('observed unusual vibration')
    expect(a.steps[0].photoIds).toEqual(['photo-id-1', 'photo-id-2'])

    // After answering, notes/photos stay on block 47, new step has no note.
    answer('47', 'yes', getBlock('47')!.onYes)
    a = useSession.getState().active!
    expect(a.steps[0].note).toBe('observed unusual vibration')
    expect(a.steps[0].photoIds).toHaveLength(2)
    expect(a.steps[1].blockId).toBe('54')
    expect(a.steps[1].note).toBeUndefined()
    expect(a.steps[1].photoIds).toEqual([])
  })
})
