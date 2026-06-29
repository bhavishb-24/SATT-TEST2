import type { Metadata } from 'next'
import { WhiteboardAi } from '@/components/sat/whiteboard/whiteboard-ai'

export const metadata: Metadata = {
  title: 'Whiteboard AI: Visual SAT Tutoring',
  description:
    'A premium AI teaching whiteboard that explains every SAT problem visually, step by step, like a world-class tutor sitting beside you.',
}

export default function WhiteboardPage() {
  return <WhiteboardAi />
}
