'use client'

import { useState } from 'react'
import type { DashboardView, TriageData } from '@/lib/sat-types'
import { cn } from '@/lib/utils'

// ── Shared primitives ──────────────────────────────────────────────────────

function SectionHeader({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
        <i className={cn('ti', icon, 'text-lg')} aria-hidden="true" />
      </div>
      <div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
    </div>
  )
}

function SettingsCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-border bg-card p-5 shadow-sm', className)}>
      {children}
    </div>
  )
}

function Row({
  label,
  sub,
  children,
}: {
  label: string
  sub?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function Divider() {
  return <div className="my-1 h-px bg-border" />
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        checked ? 'bg-primary' : 'bg-muted',
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  )
}

function Select({
  value,
  options,
  onChange,
  label,
}: {
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
  label: string
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  label,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  label: string
}) {
  return (
    <input
      aria-label={label}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-48 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
    />
  )
}

function DangerButton({
  onClick,
  children,
}: {
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
    >
      {children}
    </button>
  )
}

// ── Section panel types ──────────────────────────────────────────────────────

type SettingsSection =
  | 'account'
  | 'security'
  | 'notifications'
  | 'study'
  | 'appearance'
  | 'accessibility'
  | 'ai'
  | 'privacy'
  | 'danger'

const SECTIONS: { id: SettingsSection; label: string; icon: string }[] = [
  { id: 'account', label: 'Account', icon: 'ti-user' },
  { id: 'security', label: 'Security', icon: 'ti-shield-lock' },
  { id: 'notifications', label: 'Notifications', icon: 'ti-bell' },
  { id: 'study', label: 'Study Preferences', icon: 'ti-book' },
  { id: 'appearance', label: 'Appearance', icon: 'ti-palette' },
  { id: 'accessibility', label: 'Accessibility', icon: 'ti-accessible' },
  { id: 'ai', label: 'AI & Voice', icon: 'ti-robot' },
  { id: 'privacy', label: 'Privacy & Data', icon: 'ti-lock' },
  { id: 'danger', label: 'Account Actions', icon: 'ti-alert-triangle' },
]

// ── Main component ─────────────────────────────────────────────────────────

interface SettingsViewProps {
  triage: TriageData
  onNavigate: (view: DashboardView) => void
}

export function SettingsView({ triage }: SettingsViewProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>('account')

  // Account
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [language, setLanguage] = useState('en')
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York',
  )

  // Security
  const [twoFAEnabled, setTwoFAEnabled] = useState(false)

  // Notifications
  const [notifAI, setNotifAI] = useState(true)
  const [notifReminders, setNotifReminders] = useState(true)
  const [notifFriends, setNotifFriends] = useState(false)
  const [notifCommunity, setNotifCommunity] = useState(false)
  const [notifAchievements, setNotifAchievements] = useState(true)
  const [notifSystem, setNotifSystem] = useState(true)
  const [notifEmail, setNotifEmail] = useState(false)

  // Study preferences
  const [targetScore, setTargetScore] = useState(
    triage.goalMath && triage.goalRW
      ? String(Number(triage.goalMath) + Number(triage.goalRW))
      : '',
  )
  const [examDate, setExamDate] = useState(triage.testStartTime ?? '')
  const [studyTime, setStudyTime] = useState('evening')
  const [sessionLength, setSessionLength] = useState('45')
  const [breakReminders, setBreakReminders] = useState(true)
  const [dailyGoalReminder, setDailyGoalReminder] = useState(true)

  // Appearance
  const [reducedMotion, setReducedMotion] = useState(false)
  const [fontSize, setFontSize] = useState('medium')

  // Accessibility
  const [highContrast, setHighContrast] = useState(false)
  const [screenReaderHints, setScreenReaderHints] = useState(true)
  const [keyboardShortcuts, setKeyboardShortcuts] = useState(true)

  // AI & Voice
  const [aiPersonality, setAiPersonality] = useState('encouraging')
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [voiceSpeed, setVoiceSpeed] = useState('normal')
  const [whiteboardHints, setWhiteboardHints] = useState(true)
  const [autoExplain, setAutoExplain] = useState(true)

  // Privacy
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true)
  const [publicProfile, setPublicProfile] = useState(false)
  const [shareProgress, setShareProgress] = useState(false)

  // Save state (optimistic)
  const [saved, setSaved] = useState(false)
  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // Delete confirmation
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className="animate-fade-in flex flex-col gap-6 lg:flex-row lg:items-start">

      {/* Sidebar nav */}
      <nav
        aria-label="Settings sections"
        className="shrink-0 lg:sticky lg:top-4 lg:w-52"
      >
        <ul className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => setActiveSection(s.id)}
                aria-current={activeSection === s.id ? 'page' : undefined}
                className={cn(
                  'flex w-full items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                  activeSection === s.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <i className={cn('ti', s.icon, 'shrink-0 text-base')} aria-hidden="true" />
                <span className="hidden lg:inline">{s.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Panel */}
      <div className="flex min-w-0 flex-1 flex-col gap-5">

        {/* ── Account ────────────────────────────────────────────────── */}
        {activeSection === 'account' && (
          <>
            <SettingsCard>
              <SectionHeader icon="ti-user" title="Account" sub="Your name, email and region" />
              <div className="mt-4 flex flex-col divide-y divide-border">
                <Row label="Display name" sub="Shown on your profile and in study rooms">
                  <Input
                    label="Display name"
                    value={displayName}
                    onChange={setDisplayName}
                    placeholder="Your name"
                  />
                </Row>
                <Row label="Email address" sub="Used for sign-in and notifications">
                  <Input
                    label="Email address"
                    value={email}
                    onChange={setEmail}
                    placeholder="you@example.com"
                    type="email"
                  />
                </Row>
                <Row label="Language" sub="Interface language">
                  <Select
                    label="Language"
                    value={language}
                    onChange={setLanguage}
                    options={[
                      { value: 'en', label: 'English' },
                      { value: 'es', label: 'Spanish' },
                      { value: 'zh', label: 'Chinese (Simplified)' },
                      { value: 'hi', label: 'Hindi' },
                      { value: 'pt', label: 'Portuguese' },
                      { value: 'fr', label: 'French' },
                      { value: 'ko', label: 'Korean' },
                    ]}
                  />
                </Row>
                <Row label="Timezone" sub="Used for scheduling and countdowns">
                  <Input
                    label="Timezone"
                    value={timezone}
                    onChange={setTimezone}
                    placeholder="America/New_York"
                  />
                </Row>
              </div>
            </SettingsCard>

            <SettingsCard>
              <SectionHeader icon="ti-calendar" title="Exam Details" sub="Your target date and score" />
              <div className="mt-4 flex flex-col divide-y divide-border">
                <Row label="SAT exam date" sub="Set your countdown target">
                  <Input
                    label="SAT exam date"
                    value={examDate}
                    onChange={setExamDate}
                    placeholder="e.g. 8:00 AM Mar 8"
                  />
                </Row>
                <Row label="Target score" sub="Combined Math + R&W">
                  <Input
                    label="Target score"
                    value={targetScore}
                    onChange={setTargetScore}
                    placeholder="1400"
                    type="number"
                  />
                </Row>
              </div>
            </SettingsCard>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                className={cn(
                  'rounded-xl px-5 py-2.5 text-sm font-semibold transition-all',
                  saved
                    ? 'bg-secondary text-primary'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90',
                )}
              >
                {saved ? 'Saved' : 'Save changes'}
              </button>
            </div>
          </>
        )}

        {/* ── Security ───────────────────────────────────────────────── */}
        {activeSection === 'security' && (
          <>
            <SettingsCard>
              <SectionHeader icon="ti-shield-lock" title="Password" sub="Change your sign-in password" />
              <div className="mt-4 flex flex-col gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Current password
                  </label>
                  <input
                    type="password"
                    aria-label="Current password"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    New password
                  </label>
                  <input
                    type="password"
                    aria-label="New password"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="At least 8 characters"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    aria-label="Confirm new password"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Repeat new password"
                  />
                </div>
                <button
                  type="button"
                  className="self-start rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Update password
                </button>
              </div>
            </SettingsCard>

            <SettingsCard>
              <SectionHeader
                icon="ti-device-mobile"
                title="Two-factor authentication"
                sub="Add a second layer of security to your account"
              />
              <div className="mt-4 flex flex-col divide-y divide-border">
                <Row
                  label="Enable 2FA"
                  sub={twoFAEnabled ? 'Your account is protected' : 'Not yet configured'}
                >
                  <Toggle checked={twoFAEnabled} onChange={setTwoFAEnabled} label="Enable 2FA" />
                </Row>
              </div>
              {twoFAEnabled && (
                <div className="mt-4 rounded-xl bg-secondary/60 p-4">
                  <p className="text-sm text-secondary-foreground">
                    To complete 2FA setup, connect an authenticator app like Google Authenticator or Authy. This requires a backend integration — connect Clerk or Supabase Auth to enable this feature.
                  </p>
                </div>
              )}
            </SettingsCard>

            <SettingsCard>
              <SectionHeader
                icon="ti-devices"
                title="Active sessions"
                sub="Devices currently signed in to your account"
              />
              <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/40 p-6 text-center">
                <i className="ti ti-devices mb-2 text-2xl text-muted-foreground" aria-hidden="true" />
                <p className="text-sm font-medium text-foreground">No session data available</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Connect an auth provider to track active sessions.
                </p>
              </div>
            </SettingsCard>
          </>
        )}

        {/* ── Notifications ──────────────────────────────────────────── */}
        {activeSection === 'notifications' && (
          <SettingsCard>
            <SectionHeader
              icon="ti-bell"
              title="Notifications"
              sub="Choose what you want to hear about"
            />
            <div className="mt-4 flex flex-col divide-y divide-border">
              <Row label="AI recommendations" sub="Personalised tips from Sage">
                <Toggle checked={notifAI} onChange={setNotifAI} label="AI recommendations" />
              </Row>
              <Row label="Study reminders" sub="Daily check-in prompts">
                <Toggle checked={notifReminders} onChange={setNotifReminders} label="Study reminders" />
              </Row>
              <Row label="Friend activity" sub="When friends join rooms or earn badges">
                <Toggle checked={notifFriends} onChange={setNotifFriends} label="Friend activity" />
              </Row>
              <Row label="Community" sub="Replies to your questions and new packs">
                <Toggle checked={notifCommunity} onChange={setNotifCommunity} label="Community" />
              </Row>
              <Row label="Achievements" sub="Badge unlocks and league promotions">
                <Toggle checked={notifAchievements} onChange={setNotifAchievements} label="Achievements" />
              </Row>
              <Row label="System updates" sub="App improvements and maintenance">
                <Toggle checked={notifSystem} onChange={setNotifSystem} label="System updates" />
              </Row>
              <Divider />
              <Row label="Email digest" sub="Weekly summary sent to your inbox">
                <Toggle checked={notifEmail} onChange={setNotifEmail} label="Email digest" />
              </Row>
            </div>
          </SettingsCard>
        )}

        {/* ── Study preferences ──────────────────────────────────────── */}
        {activeSection === 'study' && (
          <>
            <SettingsCard>
              <SectionHeader
                icon="ti-clock"
                title="Study schedule"
                sub="When and how long you prefer to study"
              />
              <div className="mt-4 flex flex-col divide-y divide-border">
                <Row label="Preferred study time" sub="When Sage schedules your reminders">
                  <Select
                    label="Preferred study time"
                    value={studyTime}
                    onChange={setStudyTime}
                    options={[
                      { value: 'morning', label: 'Morning (6–9 AM)' },
                      { value: 'afternoon', label: 'Afternoon (12–3 PM)' },
                      { value: 'evening', label: 'Evening (6–9 PM)' },
                      { value: 'night', label: 'Late night (9 PM–1 AM)' },
                    ]}
                  />
                </Row>
                <Row label="Session length" sub="Default practice session duration">
                  <Select
                    label="Session length"
                    value={sessionLength}
                    onChange={setSessionLength}
                    options={[
                      { value: '15', label: '15 minutes' },
                      { value: '30', label: '30 minutes' },
                      { value: '45', label: '45 minutes' },
                      { value: '60', label: '1 hour' },
                      { value: '90', label: '90 minutes' },
                    ]}
                  />
                </Row>
                <Row label="Break reminders" sub="Pomodoro-style reminders every 25 min">
                  <Toggle checked={breakReminders} onChange={setBreakReminders} label="Break reminders" />
                </Row>
                <Row label="Daily goal reminder" sub="Morning nudge to hit your daily goal">
                  <Toggle checked={dailyGoalReminder} onChange={setDailyGoalReminder} label="Daily goal reminder" />
                </Row>
              </div>
            </SettingsCard>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                className={cn(
                  'rounded-xl px-5 py-2.5 text-sm font-semibold transition-all',
                  saved
                    ? 'bg-secondary text-primary'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90',
                )}
              >
                {saved ? 'Saved' : 'Save changes'}
              </button>
            </div>
          </>
        )}

        {/* ── Appearance ─────────────────────────────────────────────── */}
        {activeSection === 'appearance' && (
          <SettingsCard>
            <SectionHeader
              icon="ti-palette"
              title="Appearance"
              sub="Customise how SAT Sage looks"
            />
            <div className="mt-4 flex flex-col divide-y divide-border">
              <Row label="Dark mode" sub="SAT Sage is currently light-only">
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                  Coming soon
                </span>
              </Row>
              <Row label="Font size" sub="Adjust text size throughout the app">
                <Select
                  label="Font size"
                  value={fontSize}
                  onChange={setFontSize}
                  options={[
                    { value: 'small', label: 'Small' },
                    { value: 'medium', label: 'Medium (default)' },
                    { value: 'large', label: 'Large' },
                  ]}
                />
              </Row>
              <Row label="Reduce motion" sub="Fewer animations and transitions">
                <Toggle checked={reducedMotion} onChange={setReducedMotion} label="Reduce motion" />
              </Row>
            </div>
          </SettingsCard>
        )}

        {/* ── Accessibility ───────────────────────────────────────────── */}
        {activeSection === 'accessibility' && (
          <SettingsCard>
            <SectionHeader
              icon="ti-accessible"
              title="Accessibility"
              sub="Make SAT Sage work better for you"
            />
            <div className="mt-4 flex flex-col divide-y divide-border">
              <Row label="High contrast" sub="Increase colour contrast throughout the UI">
                <Toggle checked={highContrast} onChange={setHighContrast} label="High contrast" />
              </Row>
              <Row label="Screen reader hints" sub="Extra ARIA labels and live region updates">
                <Toggle checked={screenReaderHints} onChange={setScreenReaderHints} label="Screen reader hints" />
              </Row>
              <Row label="Keyboard shortcuts" sub="Navigate without a mouse">
                <Toggle checked={keyboardShortcuts} onChange={setKeyboardShortcuts} label="Keyboard shortcuts" />
              </Row>
            </div>
            {keyboardShortcuts && (
              <div className="mt-4 rounded-xl bg-muted/50 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Keyboard shortcuts
                </p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                  {[
                    ['H', 'Dashboard'],
                    ['P', 'Practice'],
                    ['F', 'Flashcards'],
                    ['M', 'Mock test'],
                    ['?', 'Help'],
                    ['Esc', 'Close panel'],
                  ].map(([key, action]) => (
                    <div key={key} className="flex items-center gap-2">
                      <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-xs text-foreground">
                        {key}
                      </kbd>
                      <span className="text-muted-foreground">{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SettingsCard>
        )}

        {/* ── AI & Voice ─────────────────────────────────────────────── */}
        {activeSection === 'ai' && (
          <>
            <SettingsCard>
              <SectionHeader
                icon="ti-robot"
                title="AI personality"
                sub="Choose how Sage communicates with you"
              />
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  { id: 'encouraging', label: 'Encouraging', desc: 'Warm, positive, motivating' },
                  { id: 'direct', label: 'Direct', desc: 'Concise, no fluff, to the point' },
                  { id: 'socratic', label: 'Socratic', desc: 'Guides you with questions' },
                  { id: 'friendly', label: 'Friendly', desc: 'Casual, conversational, relaxed' },
                  { id: 'formal', label: 'Formal', desc: 'Professional, structured' },
                  { id: 'humorous', label: 'Humorous', desc: 'Lighthearted, with light wit' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setAiPersonality(p.id)}
                    className={cn(
                      'flex flex-col gap-1 rounded-xl border p-3 text-left transition-all',
                      aiPersonality === p.id
                        ? 'border-primary bg-secondary text-foreground'
                        : 'border-border bg-background text-muted-foreground hover:border-primary/40',
                    )}
                  >
                    <span className="text-sm font-semibold text-foreground">{p.label}</span>
                    <span className="text-xs">{p.desc}</span>
                  </button>
                ))}
              </div>
            </SettingsCard>

            <SettingsCard>
              <SectionHeader
                icon="ti-microphone"
                title="Voice settings"
                sub="Control Sage's text-to-speech output"
              />
              <div className="mt-4 flex flex-col divide-y divide-border">
                <Row label="Voice narration" sub="Sage reads explanations aloud">
                  <Toggle checked={voiceEnabled} onChange={setVoiceEnabled} label="Voice narration" />
                </Row>
                <Row label="Speech speed" sub="How fast Sage speaks">
                  <Select
                    label="Speech speed"
                    value={voiceSpeed}
                    onChange={setVoiceSpeed}
                    options={[
                      { value: 'slow', label: 'Slow' },
                      { value: 'normal', label: 'Normal' },
                      { value: 'fast', label: 'Fast' },
                    ]}
                  />
                </Row>
              </div>
            </SettingsCard>

            <SettingsCard>
              <SectionHeader
                icon="ti-chalkboard"
                title="Whiteboard preferences"
                sub="Customise the AI whiteboard experience"
              />
              <div className="mt-4 flex flex-col divide-y divide-border">
                <Row label="Show step hints" sub="Sage highlights each step as it writes">
                  <Toggle checked={whiteboardHints} onChange={setWhiteboardHints} label="Show step hints" />
                </Row>
                <Row label="Auto-explain on wrong answer" sub="Sage jumps in when you miss a question">
                  <Toggle checked={autoExplain} onChange={setAutoExplain} label="Auto-explain on wrong answer" />
                </Row>
              </div>
            </SettingsCard>
          </>
        )}

        {/* ── Privacy ─────────────────────────────────────────────────── */}
        {activeSection === 'privacy' && (
          <>
            <SettingsCard>
              <SectionHeader
                icon="ti-lock"
                title="Privacy settings"
                sub="Control your data and visibility"
              />
              <div className="mt-4 flex flex-col divide-y divide-border">
                <Row label="Analytics" sub="Help improve SAT Sage by sharing usage data">
                  <Toggle checked={analyticsEnabled} onChange={setAnalyticsEnabled} label="Analytics" />
                </Row>
                <Row label="Public profile" sub="Let others find and view your profile">
                  <Toggle checked={publicProfile} onChange={setPublicProfile} label="Public profile" />
                </Row>
                <Row label="Share progress" sub="Appear on class and friend leaderboards">
                  <Toggle checked={shareProgress} onChange={setShareProgress} label="Share progress" />
                </Row>
              </div>
            </SettingsCard>

            <SettingsCard>
              <SectionHeader
                icon="ti-download"
                title="Your data"
                sub="Export or review everything SAT Sage knows about you"
              />
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <i className="ti ti-download mr-1.5" aria-hidden="true" />
                  Export study data
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <i className="ti ti-file-text mr-1.5" aria-hidden="true" />
                  Download progress report
                </button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Exports are generated in JSON format. Connect a backend to enable this feature.
              </p>
            </SettingsCard>
          </>
        )}

        {/* ── Danger zone ─────────────────────────────────────────────── */}
        {activeSection === 'danger' && (
          <SettingsCard>
            <SectionHeader
              icon="ti-alert-triangle"
              title="Account actions"
              sub="Permanent actions that cannot be undone"
            />
            <div className="mt-4 flex flex-col gap-4">
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-sm font-semibold text-foreground">Reset all progress</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Clears all practice answers, flashcard history, XP, badges, and streaks. Your account is kept.
                </p>
                <div className="mt-3">
                  <DangerButton onClick={() => {}}>Reset progress</DangerButton>
                </div>
              </div>

              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                <p className="text-sm font-semibold text-foreground">Delete account</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Permanently removes your account and all associated data. This action cannot be reversed.
                </p>
                <div className="mt-3">
                  {!confirmDelete ? (
                    <DangerButton onClick={() => setConfirmDelete(true)}>
                      Delete my account
                    </DangerButton>
                  ) : (
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-medium text-destructive">Are you sure?</p>
                      <DangerButton onClick={() => {}}>Yes, delete</DangerButton>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </SettingsCard>
        )}

      </div>
    </div>
  )
}
