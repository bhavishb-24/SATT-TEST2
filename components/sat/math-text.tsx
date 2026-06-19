'use client'

/**
 * MathText — renders a string that may contain LaTeX delimiters.
 *
 * Supported delimiters:
 *   inline:  \( ... \)
 *   display: \[ ... \]
 *   inline:  $ ... $   (single dollar, common in AI-generated content)
 *
 * Everything between delimiters is rendered via KaTeX.
 * Plain text segments are rendered as-is.
 */

import katex from 'katex'
import { Fragment } from 'react'

type Segment =
  | { kind: 'text'; value: string }
  | { kind: 'math'; value: string; display: boolean }

function parse(input: string): Segment[] {
  // Order matters: try display first (\[ \]), then inline (\( \)), then $…$
  // Use [\s\S] instead of . with the s flag so we stay ES2017-compatible.
  const pattern = /\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)|\$([^$\n]+?)\$/g
  const segments: Segment[] = []
  let last = 0
  for (const match of input.matchAll(pattern)) {
    if (match.index! > last) {
      segments.push({ kind: 'text', value: input.slice(last, match.index) })
    }
    if (match[1] !== undefined) {
      segments.push({ kind: 'math', value: match[1], display: true })
    } else if (match[2] !== undefined) {
      segments.push({ kind: 'math', value: match[2], display: false })
    } else if (match[3] !== undefined) {
      segments.push({ kind: 'math', value: match[3], display: false })
    }
    last = match.index! + match[0].length
  }
  if (last < input.length) {
    segments.push({ kind: 'text', value: input.slice(last) })
  }
  return segments.length > 0 ? segments : [{ kind: 'text', value: input }]
}

function renderKatex(tex: string, display: boolean): string {
  try {
    return katex.renderToString(tex.trim(), {
      displayMode: display,
      throwOnError: false,
      strict: false,
    })
  } catch {
    return tex
  }
}

interface Props {
  children: string
  className?: string
  block?: boolean
}

export function MathText({ children, className, block = false }: Props) {
  const segments = parse(children)
  const Tag = block ? 'div' : 'span'

  return (
    <Tag className={className}>
      {segments.map((seg, i) =>
        seg.kind === 'text' ? (
          <Fragment key={i}>{seg.value}</Fragment>
        ) : (
          <span
            key={i}
            className={seg.display ? 'my-1 block' : 'inline'}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: renderKatex(seg.value, seg.display) }}
          />
        ),
      )}
    </Tag>
  )
}
