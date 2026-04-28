// Seed Fault Isolation data for the C-130 propeller system (TO 1C-130H-2-61FI-00-1).
// Sourced from the "Tribal Knowledge" deck, Table 2-2 fault codes and Figure 2-4
// propeller assembly malfunction flowcharts. Values shortened for prototype use.

export type Outcome = {
  kind: 'resolved' | 'escalate'
  message: string
}

export type Block = {
  id: string
  figure: string
  title: string
  question: string
  notes?: string[]
  onYes: string | Outcome
  onNo: string | Outcome
}

export type FaultCode = {
  code: string
  description: string
  reference: string
  entry: string | null // block id, or null if tree not yet authored
}

export const faultCodes: FaultCode[] = [
  {
    code: '6110002',
    description: 'Beta indicator light failed to illuminate in bright/dim/both modes when throttle retarded below FLIGHT IDLE/FLT IDLE.',
    reference: 'Figure 2-1, Prep A → Figure 2-4 (varies by tail number)',
    entry: null,
  },
  {
    code: '6110003',
    description: 'Propeller low pitch slow or did not retract when throttle was placed to GROUND IDLE/GND IDLE.',
    reference: 'Figure 2-1, Prep A → Figure 2-4, block 532',
    entry: null,
  },
  {
    code: '6110004',
    description: 'Flight idle torque spread not within limits.',
    reference: 'No preparation required. Figure 2-4, block 47.',
    entry: '47',
  },
  {
    code: '6110005',
    description: 'Engine RPM not within flight manual limits in propeller governing range.',
    reference: 'Figure 2-2, Prep B → Figure 2-4, block 52',
    entry: null,
  },
  {
    code: '6110006',
    description: 'Symmetric engine torque exceeds 1000 in-lb for engines 1&4 / 2&3 at maximum reverse.',
    reference: 'Figure 2-4, block 511',
    entry: null,
  },
  {
    code: '6110007',
    description: 'Engine RPM not within limits at maximum reverse setting.',
    reference: 'Fault is in engine or RPM indicating system. See TO 1C-130H-2-70F1-00-1-1.',
    entry: null,
  },
  {
    code: '6110008',
    description: 'Beta indicator light is on with throttle above FLIGHT IDLE/FLT IDLE gate.',
    reference: 'Figure 2-1, Prep A → Figure 2-4, block 241',
    entry: null,
  },
]

// Blocks for fault code 6110004 walkthrough. Block IDs mirror the TO.
export const blocks: Record<string, Block> = {
  '47': {
    id: '47',
    figure: '2-4',
    title: 'Block 47 — Throttle crossover check',
    question:
      'a. Advance throttles (1) above crossover (at least 8000 in-lb). b. Place propeller governor control switches (2) to MECH GOV/MECH. c. Place SYNCHROPHASE MASTER/MSTR switch (3) to OFF. Is RPM for propeller under test between 99.8 and 100.2 percent?',
    onYes: '54',
    onNo: '57',
  },
  '54': {
    id: '54',
    figure: '2-4',
    title: 'Block 54 — Synchrophaser index',
    question:
      'Perform synchrophaser index in accordance with TO 1C-130H-2-61JG-10-1, 61-10-02 (subtasks 1-2-6). Is index satisfactory?',
    notes: [
      'Check all conditions may cause cycle variation; however, these should not exceed 1 percent.',
      'Place propeller governor control switches to MECH GOV/MECH. RPM stable (should not vary more than 0.5 percent)?',
    ],
    onYes: { kind: 'resolved', message: 'TO SHT 157 — Continue in sheet 157 for verification.' },
    onNo: '55',
  },
  '55': {
    id: '55',
    figure: '2-4',
    title: 'Block 55 — Propeller governor in NORMAL',
    question:
      'Place propeller governor control switches to NORMAL/NORM. Is RPM stable in normal governing mode after index?',
    onYes: { kind: 'resolved', message: 'TO SHT 19 — Continue in sheet 19 for verification.' },
    onNo: '58',
  },
  '57': {
    id: '57',
    figure: '2-4',
    title: 'Block 57 — Engine shutdown & mechanical governing adjust',
    question:
      'Shut down engines in accordance with TO 1C-130H-2-71JG-00-1, 71-00-10; TO 1C-130(A)H-2-71JG-00-1, 71-00-10; or TO 1C-130(M)H-2-71JG-00-1, 71-00-10; then adjust propeller mechanical governing speed in accordance with TO 1C-130H-2-61JG-10-1, 61-10-23. Does adjustment resolve the flight idle torque spread?',
    onYes: { kind: 'resolved', message: 'Mechanical governing adjustment resolved the fault. Record work in AFTO 781A.' },
    onNo: '58',
  },
  '58': {
    id: '58',
    figure: '2-4',
    title: 'Block 58 — Synchrophaser fault',
    question:
      'Problem is in synchrophaser system. Shut down engines per TO 1C-130H-2-71JG-00-1, 71-00-10 (or applicable variant), then continue troubleshooting. Has the synchrophaser been isolated as the root cause?',
    onYes: {
      kind: 'resolved',
      message: 'Synchrophaser identified as root cause. Replace/repair per applicable TO and record in AFTO 781A.',
    },
    onNo: {
      kind: 'escalate',
      message:
        'Escalate: synchrophaser suspected but not confirmed. Coordinate with SME / propeller shop and reference Figure 2-4 sheet 167.',
    },
  },
}

export function getFaultCode(code: string): FaultCode | undefined {
  return faultCodes.find((f) => f.code === code)
}

export function getBlock(id: string): Block | undefined {
  return blocks[id]
}
