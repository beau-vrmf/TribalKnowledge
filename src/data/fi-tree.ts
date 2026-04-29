// Seed Fault Isolation data for the C-130 propeller system.
// Source: TO 1C-130H-2-61FI-00-1, Figure 2-4 (Propeller Assembly Malfunction).
// All block text is VERBATIM from the Technical Order. Do not paraphrase.

export type Outcome = {
  kind: 'resolved' | 'escalate'
  message: string
}

export type Block = {
  id: string // canonical: '<TO>/<figure>/<sheet>/<blockNumber>'
  technicalOrder: string // e.g. '1C-130H-2-61FI-00-1'
  figure: string // e.g. '2-4'
  sheet: string // e.g. '15'
  blockNumber: string // e.g. '47'
  text: string // verbatim TO text (includes the trailing question on decision blocks)
  sheetNotes?: string[] // verbatim NOTE callouts that apply to this block
  imageRef?: string // optional path to TO source image, e.g. '/source/figures/2-4/sht-15.png'
  onYes?: string // BlockRef id for YES; if absent → terminal block
  onNo?: string // BlockRef id for NO; if absent → terminal block
  terminalKind?: 'resolved' | 'escalate' // only meaningful when onYes/onNo are absent
  stub?: true // marks blocks not yet authored verbatim (placeholder)
}

export type FaultCode = {
  code: string
  description: string // verbatim from Table 2-2 'AFTO Form 781A report' column
  reference: string // verbatim from Table 2-2 'Fault isolation reference' column
  entry: string | null // BlockRef id, or null if tree not yet authored
}

const TO = '1C-130H-2-61FI-00-1'
const FIG = '2-4'

export function bid(sheet: string, blockNumber: string): string {
  return `${TO}/${FIG}/${sheet}/${blockNumber}`
}

function block(
  sheet: string,
  blockNumber: string,
  partial: Omit<Block, 'id' | 'technicalOrder' | 'figure' | 'sheet' | 'blockNumber'>,
): Block {
  return {
    id: bid(sheet, blockNumber),
    technicalOrder: TO,
    figure: FIG,
    sheet,
    blockNumber,
    ...partial,
  }
}

// Fault codes from Table 2-2. Descriptions/references are verbatim.
export const faultCodes: FaultCode[] = [
  {
    code: '6110002',
    description:
      'Beta indicator light No. (1)(2)(3)(4) failed to come on in (bright)(dim)(both bright and dim) modes when throttle was retarded below FLIGHT IDLE/FLT IDLE gate.',
    reference:
      'Perform figure 2-1, Preparation A, then go to figure 2-4: Airplanes prior to AF92-0547 and AF92-3021 through AF92-3024 — block 74 for bright mode failure, block 131 for dim mode failure, block 80 for both modes failure. Airplanes AF92-0547 through AF92-2104 and AF92-3281 and up — block 76 for bright mode failure, block 19 for dim mode failure, block 87 for both modes failure.',
    entry: null,
  },
  {
    code: '6110003',
    description:
      'Propeller No. (1)(2)(3)(4) low pitch was slow or stop did not retract when throttle was placed to GROUND IDLE/GND IDLE as indicated by lack of torque decrease.',
    reference: 'Perform figure 2-1, Preparation A, then go to figure 2-4, block 532.',
    entry: null,
  },
  {
    code: '6110004',
    description: 'No. (1)(2)(3)(4) flight idle torque spread is not within limits.',
    reference: 'No preparation required. Go to figure 2-4, block 47.',
    entry: bid('15', '47'),
  },
  {
    code: '6110005',
    description:
      'Engine No. (1)(2)(3)(4) RPM is not within flight manual limits in propeller governing range. RPM indicated __ percent with throttle at __ position.',
    reference:
      'Perform figure 2-2, Preparation B. Start engines in accordance with TO 1C-130H-2-71JG-00-1, 71-00-01; or TO 1C-130(A)H-2-71JG-00-1, 71-00-10; and go to figure 2-4, block 52.',
    entry: bid('17', '52'),
  },
  {
    code: '6110006',
    description:
      'Symmetric engine torque exceeds 1000 inch-pounds for engines (1 and 4)(2 and 3) at maximum reverse setting.',
    reference: 'No preparation required. Go to figure 2-4, block 511.',
    entry: null,
  },
  {
    code: '6110007',
    description: 'Engine RPM is not within limits at maximum reverse setting.',
    reference:
      'Fault is in engine or RPM indicating system. Go to TO 1C-130H-2-70F1-00-1-1, Section II, and continue troubleshooting.',
    entry: null,
  },
  {
    code: '6110008',
    description:
      'Beta indicator light No. (1)(2)(3)(4) is on with throttle above FLIGHT IDLE/FLT IDLE gate.',
    reference: 'Perform figure 2-1, Preparation A, then go to figure 2-4, block 241.',
    entry: null,
  },
]

const blockList: Block[] = [
  // ======================================================================
  // Figure 2-4, Sheet 15 — fault code 6110004 path
  // ======================================================================
  block('15', '47', {
    text: `a. Shut down engines in accordance with TO 1C-130H-2-71JG-00-1, 71-00-10; or TO 1C-130(A)H-2-71JG-00-1, 71-00-10.
b. Perform operational checkout of propeller - static condition in accordance with TO 1C-130H-2-61JG-10-1, 61-10-01.
Is check satisfactory?`,
    onYes: bid('15', '50'),
    onNo: bid('15', '49'),
  }),
  block('15', '49', {
    text: `Rig engine coordinator-to-propeller control assembly linkage in accordance with TO 1C-130H-2-61JG-10-1, 61-20-21.`,
    terminalKind: 'resolved',
  }),
  block('15', '50', {
    text: `Adjust or replace low pitch stop assembly in accordance with TO 1C-130H-2-61JG-10-1, 61-10-12.`,
    terminalKind: 'resolved',
  }),

  // ======================================================================
  // Figure 2-4, Sheet 17 — fault code 6110005 path
  // ======================================================================
  block('17', '52', {
    text: `a. Advance throttles (1) above crossover (at least 8000 inch-pounds torque).
b. Place propeller governor control switches (2) to MECH GOV/MECH.
c. Place SYNCHROPHASE MASTER/MSTR switch (3) to OFF.
Is RPM for propeller under test between 99.8 and 100.2 percent?`,
    onYes: bid('17', '53'),
    onNo: bid('17', '57'),
  }),
  block('17', '53', {
    text: `Perform synchrophaser index in accordance with TO 1C-130H-2-61JG-10-1, 61-10-02 (subtask 1-2-6).
Is index satisfactory?`,
    onYes: bid('17', '54'),
    onNo: bid('17', '58'),
  }),
  block('17', '54', {
    text: `NOTE
Certain wind conditions may cause cyclic variation, however these should not exceed 1 percent.

Place propeller governor control switches to MECH GOV/MECH. Is RPM stable (RPM does not vary more than 0.5 percent.)?`,
    onYes: bid('17', '55'),
    onNo: bid('cross-sheet', '157'),
  }),
  block('17', '55', {
    text: `Place propeller governor control switches to NORMAL/NORM.
Is RPM stable?`,
    onYes: bid('cross-sheet', '19'),
    onNo: bid('17', '56'),
  }),
  block('17', '56', {
    text: `Perform synchrophaser index in accordance with TO 1C-130H-2-61JG-10-1, 61-10-02 (subtask 1-2-6).
Is RPM stable in normal governing mode after index?`,
    onYes: bid('17', '60'),
    onNo: bid('17', '59'),
  }),
  block('17', '57', {
    text: `Shut down engines in accordance with TO 1C-130H-2-71JG-00-1, 71-00-10; TO 1C-130(A)H-2-71JG-00-1, 71-00-10; or TO 1C-130(M)H-2-71JG-00-1, 71-00-10; then adjust propeller mechanical governing speed in accordance with TO 1C-130H-2-61JG-10-1, 61-10-23.`,
    terminalKind: 'resolved',
  }),
  block('17', '58', {
    text: `Fault is in synchrophaser system. Shut down engines in accordance with TO 1C-130H-2-71JG-00-1, 71-00-10; TO 1C-130(A)H-2-71JG-00-1, 71-00-10; or TO 1C-130(M)H-2-71JG-00-1, 71-00-10; then go to Section III and continue troubleshooting.`,
    terminalKind: 'escalate',
  }),
  block('17', '59', {
    text: `Problem is in synchrophaser system. Shut down engines in accordance with TO 1C-130H-2-71JG-00-1, 71-00-10; TO 1C-130(A)H-2-71JG-00-1, 71-00-10; or TO 1C-130(M)H-2-71JG-00-1, 71-00-10; then go to Section III and continue troubleshooting.`,
    terminalKind: 'escalate',
  }),
  block('17', '60', {
    text: `Synchrophaser index corrected malfunction. Shut down engines in accordance with TO 1C-130H-2-71JG-00-1, 71-00-10; TO 1C-130(A)H-2-71JG-00-1, 71-00-10; or TO 1C-130(M)H-2-71JG-00-1, 71-00-10.`,
    terminalKind: 'resolved',
  }),

  // ======================================================================
  // Cross-sheet continuation stubs — author when those sheets are walked.
  // ======================================================================
  block('cross-sheet', '157', {
    text: `Continue troubleshooting on Figure 2-4 Sheet 157. This sheet has not yet been authored in the app — coordinate with SME or reference the original Technical Order.`,
    terminalKind: 'escalate',
    stub: true,
  }),
  block('cross-sheet', '19', {
    text: `Continue troubleshooting on Figure 2-4 Sheet 19. This sheet has not yet been authored in the app — coordinate with SME or reference the original Technical Order.`,
    terminalKind: 'escalate',
    stub: true,
  }),
]

export const blocks: Record<string, Block> = Object.fromEntries(
  blockList.map((b) => [b.id, b]),
)

export function getFaultCode(code: string): FaultCode | undefined {
  return faultCodes.find((f) => f.code === code)
}

export function getBlock(id: string): Block | undefined {
  return blocks[id]
}

export function isTerminal(b: Block): boolean {
  return !b.onYes && !b.onNo
}
