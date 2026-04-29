import { describe, expect, it, beforeEach } from 'vitest'
import { bid, getBlock, getFaultCode } from '../data/fi-tree'
import { useSession } from '../store/session'

const B47 = bid('15', '47')
const B49 = bid('15', '49')
const B50 = bid('15', '50')
const B52 = bid('17', '52')
const B53 = bid('17', '53')
const B54 = bid('17', '54')
const B57 = bid('17', '57')
const B58 = bid('17', '58')

describe('FI tree navigation — fault 6110004 (Sheet 15)', () => {
  beforeEach(() => {
    useSession.setState({ active: null })
  })

  it('has the fault code wired to scoped block id 15/47', () => {
    const fc = getFaultCode('6110004')
    expect(fc).toBeDefined()
    expect(fc?.entry).toBe(B47)
    expect(getBlock(B47)).toBeDefined()
  })

  it('starts a session with the entry block as the first step', () => {
    const { startSession } = useSession.getState()
    startSession('6110004', B47)
    const a = useSession.getState().active!
    expect(a.steps).toHaveLength(1)
    expect(a.steps[0].blockId).toBe(B47)
    expect(a.steps[0].answer).toBeNull()
    expect(a.currentBlockId).toBe(B47)
  })

  it('walks the YES branch 47 → 50 (terminal: resolved)', () => {
    const { startSession, answer, completeTerminal } = useSession.getState()
    startSession('6110004', B47)

    const b47 = getBlock(B47)!
    answer(B47, 'yes', b47.onYes)
    let a = useSession.getState().active!
    expect(a.currentBlockId).toBe(B50)
    expect(a.steps).toHaveLength(2)

    const b50 = getBlock(B50)!
    expect(b50.onYes).toBeUndefined()
    expect(b50.onNo).toBeUndefined()
    completeTerminal(B50, { kind: b50.terminalKind!, message: b50.text })
    a = useSession.getState().active!
    expect(a.outcome?.kind).toBe('resolved')
    expect(a.steps.map((s) => s.blockId)).toEqual([B47, B50])
  })

  it('walks the NO branch 47 → 49 (terminal: resolved)', () => {
    const { startSession, answer, completeTerminal } = useSession.getState()
    startSession('6110004', B47)

    answer(B47, 'no', getBlock(B47)!.onNo)
    expect(useSession.getState().active?.currentBlockId).toBe(B49)

    const b49 = getBlock(B49)!
    completeTerminal(B49, { kind: b49.terminalKind!, message: b49.text })
    const a = useSession.getState().active!
    expect(a.outcome?.kind).toBe('resolved')
  })

  it('attaches notes and photos to the current block visit', () => {
    const { startSession, setNoteOnCurrent, addPhotoToCurrent, answer } = useSession.getState()
    startSession('6110004', B47)

    setNoteOnCurrent('observed unusual vibration')
    addPhotoToCurrent('photo-id-1')
    addPhotoToCurrent('photo-id-2')

    let a = useSession.getState().active!
    expect(a.steps[0].note).toBe('observed unusual vibration')
    expect(a.steps[0].photoIds).toEqual(['photo-id-1', 'photo-id-2'])

    answer(B47, 'yes', getBlock(B47)!.onYes)
    a = useSession.getState().active!
    expect(a.steps[0].note).toBe('observed unusual vibration')
    expect(a.steps[0].photoIds).toHaveLength(2)
    expect(a.steps[1].blockId).toBe(B50)
    expect(a.steps[1].note).toBeUndefined()
    expect(a.steps[1].photoIds).toEqual([])
  })
})

describe('FI tree navigation — fault 6110005 (Sheet 17)', () => {
  beforeEach(() => {
    useSession.setState({ active: null })
  })

  it('walks 52 → 57 (NO at 52 lands on terminal: resolved)', () => {
    const { startSession, answer, completeTerminal } = useSession.getState()
    startSession('6110005', B52)

    answer(B52, 'no', getBlock(B52)!.onNo)
    expect(useSession.getState().active?.currentBlockId).toBe(B57)

    const b57 = getBlock(B57)!
    completeTerminal(B57, { kind: b57.terminalKind!, message: b57.text })
    expect(useSession.getState().active?.outcome?.kind).toBe('resolved')
  })

  it('walks 52 → 53 → 58 (escalate to synchrophaser)', () => {
    const { startSession, answer, completeTerminal } = useSession.getState()
    startSession('6110005', B52)

    answer(B52, 'yes', getBlock(B52)!.onYes)
    expect(useSession.getState().active?.currentBlockId).toBe(B53)

    answer(B53, 'no', getBlock(B53)!.onNo)
    expect(useSession.getState().active?.currentBlockId).toBe(B58)

    const b58 = getBlock(B58)!
    completeTerminal(B58, { kind: b58.terminalKind!, message: b58.text })
    const a = useSession.getState().active!
    expect(a.outcome?.kind).toBe('escalate')
    expect(a.steps.map((s) => s.blockId)).toEqual([B52, B53, B58])
  })

  it('walks 52 → 53 → 54 (decision continues into authored tree)', () => {
    const { startSession, answer } = useSession.getState()
    startSession('6110005', B52)
    answer(B52, 'yes', getBlock(B52)!.onYes)
    answer(B53, 'yes', getBlock(B53)!.onYes)
    expect(useSession.getState().active?.currentBlockId).toBe(B54)
  })
})
