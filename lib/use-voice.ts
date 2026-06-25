'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type CommandHandler = (command: string) => void

interface UseVoiceOptions {
  rate?: number
  onCommand?: CommandHandler
}

// Wraps the Web Speech API: speechSynthesis for TTS and SpeechRecognition for commands.
export function useVoice({ rate = 0.9, onCommand }: UseVoiceOptions = {}) {
  const [supported, setSupported] = useState(false)
  const [recognitionSupported, setRecognitionSupported] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [listening, setListening] = useState(false)
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)
  const recognitionRef = useRef<any>(null)
  const commandRef = useRef<CommandHandler | undefined>(onCommand)
  const rateRef = useRef(rate)

  useEffect(() => {
    commandRef.current = onCommand
  }, [onCommand])
  useEffect(() => {
    rateRef.current = rate
  }, [rate])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const hasTTS = 'speechSynthesis' in window
    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setSupported(hasTTS)
    setRecognitionSupported(!!SR)

    if (hasTTS) {
      const pickVoice = () => {
        const voices = window.speechSynthesis.getVoices()
        // Prefer a female en-US voice when available.
        const preferred =
          voices.find(
            (v) =>
              v.lang.startsWith('en-US') &&
              /female|samantha|victoria|zira|joanna|aria|jenny/i.test(v.name),
          ) ||
          voices.find((v) => v.lang.startsWith('en-US')) ||
          voices[0]
        voiceRef.current = preferred || null
      }
      pickVoice()
      window.speechSynthesis.onvoiceschanged = pickVoice
      return () => {
        // Clean up the handler so it doesn't persist after unmount.
        if (window.speechSynthesis.onvoiceschanged === pickVoice) {
          window.speechSynthesis.onvoiceschanged = null
        }
      }
    }
  }, [])

  const speak = useCallback(
    (text: string, opts?: { force?: boolean }) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
      if (!enabled && !opts?.force) return
      try {
        window.speechSynthesis.cancel()
        const utter = new SpeechSynthesisUtterance(text)
        if (voiceRef.current) utter.voice = voiceRef.current
        utter.rate = rateRef.current
        utter.pitch = 1.05
        utter.lang = 'en-US'
        window.speechSynthesis.speak(utter)
      } catch {
        /* ignore */
      }
    },
    [enabled],
  )

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  }, [])

  const startListening = useCallback(() => {
    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        /* ignore */
      }
    }
    const recognition = new SR()
    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = 'en-US'
    recognition.onresult = (event: any) => {
      const last = event.results[event.results.length - 1]
      const transcript = last[0].transcript.trim().toLowerCase()
      commandRef.current?.(transcript)
    }
    recognition.onend = () => {
      // Auto-restart while enabled to keep listening.
      if (recognitionRef.current === recognition && enabled) {
        try {
          recognition.start()
        } catch {
          setListening(false)
        }
      } else {
        setListening(false)
      }
    }
    recognition.onerror = () => setListening(false)
    recognitionRef.current = recognition
    try {
      recognition.start()
      setListening(true)
    } catch {
      setListening(false)
    }
  }, [enabled])

  const stopListening = useCallback(() => {
    const rec = recognitionRef.current
    recognitionRef.current = null
    if (rec) {
      try {
        rec.stop()
      } catch {
        /* ignore */
      }
    }
    setListening(false)
  }, [])

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev
      if (!next) {
        stopSpeaking()
        stopListening()
      }
      return next
    })
  }, [stopSpeaking, stopListening])

  // Start/stop recognition when enabled changes.
  useEffect(() => {
    if (enabled && recognitionSupported) {
      startListening()
    } else {
      stopListening()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, recognitionSupported])

  return {
    supported,
    recognitionSupported,
    enabled,
    listening,
    speak,
    stopSpeaking,
    toggle,
    setEnabled,
  }
}
