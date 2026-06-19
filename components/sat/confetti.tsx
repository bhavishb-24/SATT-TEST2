'use client'

import { useMemo } from 'react'

// Lightweight CSS confetti — no dependencies.
export function Confetti({ count = 60 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => {
        const colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#14b8a6']
        return {
          id: i,
          left: Math.random() * 100,
          delay: Math.random() * 0.6,
          duration: 2 + Math.random() * 1.5,
          color: colors[i % colors.length],
          size: 6 + Math.random() * 6,
          rotate: Math.random() * 360,
        }
      }),
    [count],
  )

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            top: '-10%',
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size * 1.6}px`,
            backgroundColor: p.color,
            transform: `rotate(${p.rotate}deg)`,
            animation: `confettiFall ${p.duration}s linear ${p.delay}s forwards`,
            borderRadius: '2px',
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0.9; }
        }
      `}</style>
    </div>
  )
}
