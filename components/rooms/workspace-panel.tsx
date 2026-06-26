'use client'

import { cn } from '@/lib/utils'
import type { WorkspaceTab, AiStatus } from '@/lib/room-types'

interface Props {
  activeTab: WorkspaceTab
  onTabChange: (t: WorkspaceTab) => void
  aiStatus: AiStatus
  roomName: string
}

const TABS: { id: WorkspaceTab; label: string; icon: string }[] = [
  { id: 'whiteboard', label: 'Whiteboard', icon: 'ti-chalkboard' },
  { id: 'questions',  label: 'Questions',  icon: 'ti-pencil-question' },
  { id: 'flashcards', label: 'Flashcards', icon: 'ti-cards' },
  { id: 'practice',  label: 'Practice',   icon: 'ti-clipboard-check' },
  { id: 'notes',     label: 'Notes',      icon: 'ti-notebook' },
]

// ── Whiteboard ───────────────────────────────────────────────────────────────
// Empty canvas with drawing toolbar. Cursors and shared strokes
// are populated in real time once a multiplayer backend is connected.

function WhiteboardTab({ aiStatus }: { aiStatus: AiStatus }) {
  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center gap-1 border-b border-border bg-card px-4 py-2">
        {[
          { icon: 'ti-pencil',     title: 'Draw' },
          { icon: 'ti-highlight',  title: 'Highlight' },
          { icon: 'ti-circle',     title: 'Circle' },
          { icon: 'ti-eraser',     title: 'Erase' },
          { icon: 'ti-text-size',  title: 'Text' },
          { icon: 'ti-arrow-back', title: 'Undo' },
        ].map((tool, i) => (
          <button
            key={tool.title}
            title={tool.title}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors hover:bg-secondary hover:text-primary',
              i === 0 ? 'bg-secondary text-primary' : 'text-muted-foreground',
            )}
          >
            <i className={cn('ti', tool.icon)} aria-hidden="true" />
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium">Everyone can draw</span>
          <i className="ti ti-users text-sm text-primary" aria-hidden="true" />
        </div>
      </div>

      {/* Board surface — empty until participants join and draw */}
      <div className="relative flex-1 overflow-hidden board-grid bg-background/60">

        {/* Empty state — shown when no one has drawn yet */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center pointer-events-none select-none">
          <i className="ti ti-pencil-question text-4xl text-border" aria-hidden="true" />
          <p className="text-sm text-muted-foreground/60">
            The whiteboard is empty — start drawing or ask the AI to explain a topic.
          </p>
        </div>

        {/* AI tutor status overlay */}
        {aiStatus !== 'idle' && (
          <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-2xl border border-primary/20 bg-card/90 px-3 py-1.5 shadow-sm backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <span className="text-xs font-semibold text-primary">
              Sage AI is {aiStatus === 'teaching' ? 'explaining' : aiStatus}…
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Placeholder for future tabs ───────────────────────────────────────────────

function PlaceholderTab({ label, description }: { label: string; description: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-secondary">
        <i className="ti ti-sparkles text-3xl text-primary" aria-hidden="true" />
      </div>
      <div>
        <p className="font-serif text-xl font-bold text-foreground">{label}</p>
        <p className="mt-1.5 text-sm text-muted-foreground text-pretty">{description}</p>
      </div>
    </div>
  )
}

export function WorkspacePanel({ activeTab, onTabChange, aiStatus, roomName }: Props) {
  return (
    <div className="flex h-full flex-col">

      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-card px-4 py-3">
        <div>
          <p className="text-xs text-muted-foreground">Shared workspace</p>
          <p className="text-sm font-bold text-foreground">{roomName}</p>
        </div>

        {/* Tab pills */}
        <div className="flex items-center gap-1 rounded-2xl border border-border bg-muted/50 p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-card text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <i className={cn('ti', tab.icon, 'text-sm')} aria-hidden="true" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'whiteboard' && <WhiteboardTab aiStatus={aiStatus} />}
        {activeTab === 'questions'  && (
          <PlaceholderTab
            label="Group Questions"
            description="Questions will appear here once the AI generates them for your session."
          />
        )}
        {activeTab === 'flashcards' && (
          <PlaceholderTab
            label="Group Flashcards"
            description="The AI will create shared flashcards based on what the group is studying."
          />
        )}
        {activeTab === 'practice'   && (
          <PlaceholderTab
            label="Practice Test"
            description="Start a timed group practice round — the AI scores and reviews everyone together."
          />
        )}
        {activeTab === 'notes'      && (
          <PlaceholderTab
            label="Shared Notes"
            description="Notes typed here are visible to everyone in the room in real time."
          />
        )}
      </div>
    </div>
  )
}
