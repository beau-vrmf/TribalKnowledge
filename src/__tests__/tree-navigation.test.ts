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

  it('walks the happy path 47 → 54 → resolved', () => {
    const { startSession, answer } = useSession.getState()
    startSession('6110004', '47')

    // Block 47: YES (RPM in spec) → block 54
    const b47 = getBlock('47')!
    answer('47', 'yes', b47.onYes)
    expect(useSession.getState().active?.currentBlockId).toBe('54')

    // Block 54: YES (index satisfactory) → resolved outcome
    const b54 = getBlock('54')!
    answer('54', 'yes', b54.onYes)
    const active = useSession.getState().active!
    expect(active.outcome?.kind).toBe('resolved')
    expect(active.steps).toHaveLength(2)
  })

  it('walks an escalation path 47 → 57 → 58 → escalate', () => {
    const { startSession, answer } = useSession.getState()
    startSession('6110004', '47')

    const b47 = getBlock('47')!
    answer('47', 'no', b47.onNo) // → 57
    expect(useSession.getState().active?.currentBlockId).toBe('57')

    const b57 = getBlock('57')!
    answer('57', 'no', b57.onNo) // → 58
    expect(useSession.getState().active?.currentBlockId).toBe('58')

    const b58 = getBlock('58')!
    answer('58', 'no', b58.onNo) // escalate outcome
    const active = useSession.getState().active!
    expect(active.outcome?.kind).toBe('escalate')
    expect(active.steps.map((s) => s.blockId)).toEqual(['47', '57', '58'])
  })
})
