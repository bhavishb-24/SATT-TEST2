'use client'

import { useCallback, useRef, useState } from 'react'

/** Strip the **bold** markers so they aren't read aloud literally. */
function plain(text: string): string {
  return text.replace(/\*\*/g, '').replace(/[#_`]/g, '').trim()
}

function speakBrowser(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return resolve(false)
    try {
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.rate = 0.95
      u.pitch = 1.05
      u.lang = 'en-US'
      u.onend = () => resolve(true)
      u.onerror = () => resolve(false)
      window.speechSynthesis.speak(u)
    } catch {
      resolve(false)
    }
  })
}

/**
 * Voice narration that prefers OpenAI TTS (high quality) and falls back to the
 * browser's speechSynthesis. `narrate` resolves to true once audio finished
 * playing, false if it was muted or could not play.
 */
export function useNarration() {
  const [muted, setMuted] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const tokenRef = useRef(0)
  const mutedRef = useRef(false)
  mutedRef.current = muted

  const stop = useCallback(() => {
    tokenRef.current++
    const a = audioRef.current
    if (a) {
      try {
        a.pause()
      } catch {
        /* ignore */
      }
      audioRef.current = null
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setSpeaking(false)
  }, [])

  const narrate = useCallback(async (text: string): Promise<boolean> => {
    const clean = plain(text)
    if (mutedRef.current || !clean) return false
    const token = ++tokenRef.current
    setSpeaking(true)
    try {
      const res = await fetch('/api/whiteboard-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: clean }),
      })
      if (token !== tokenRef.current) return false
      if (!res.ok) throw new Error('tts failed')
      const blob = await res.blob()
      if (token !== tokenRef.current) return false
      const url = URL.createObjectURL(blob)
      const played = await new Promise<boolean>((resolve) => {
        const audio = new Audio(url)
        audioRef.current = audio
        audio.onended = () => resolve(true)
        audio.onerror = () => resolve(false)
        audio.play().catch(() => resolve(false))
      })
      URL.revokeObjectURL(url)
      if (token !== tokenRef.current) return false
      if (!played) {
        const ok = await speakBrowser(clean)
        return token === tokenRef.current ? ok : false
      }
      return true
    } catch {
      if (token !== tokenRef.current) return false
      const ok = await speakBrowser(clean)
      return token === tokenRef.current ? ok : false
    } finally {
      if (token === tokenRef.current) setSpeaking(false)
    }
  }, [])

  const toggleMuted = useCallback(() => {
    setMuted((m) => {
      const next = !m
      if (next) {
        tokenRef.current++
        const a = audioRef.current
        if (a) {
          try {
            a.pause()
          } catch {
            /* ignore */
          }
          audioRef.current = null
        }
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel()
        }
        setSpeaking(false)
      }
      return next
    })
  }, [])

  return { muted, speaking, narrate, stop, toggleMuted }
}
