'use client'

import { useMemo } from 'react'
import katex from 'katex'

interface MathProps {
  expression: string
  display?: boolean
  className?: string
}

export function Math({ expression, display = false, className }: MathProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(expression, {
        displayMode: display,
        throwOnError: false,
        output: 'html',
      })
    } catch {
      return expression
    }
  }, [expression, display])

  return (
    <span
      className={className}
      // KaTeX output is generated locally from our own static formula strings.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
