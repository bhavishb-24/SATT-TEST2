import { jsPDF } from 'jspdf'
import { FORMULA_GROUPS } from './formula-data'

/**
 * Converts a LaTeX expression (as stored in FORMULA_GROUPS) into a readable
 * plain-text approximation suitable for a standard PDF font. jsPDF's core
 * fonts can't typeset real math, so we map the common commands/symbols used in
 * this app to Unicode equivalents.
 */
function latexToPlain(input: string): string {
  let s = input

  // \frac{a}{b} -> (a)/(b)
  s = s.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '($1)/($2)')
  // \sqrt{x} -> √(x)
  s = s.replace(/\\sqrt\{([^{}]*)\}/g, '\u221A($1)')
  // \text{...} -> ...
  s = s.replace(/\\text\{([^{}]*)\}/g, '$1')
  // \bar{x} -> x̄ (combining overline)
  s = s.replace(/\\bar\{([^{}]*)\}/g, '$1\u0304')

  const symbols: Record<string, string> = {
    '\\pm': '\u00B1',
    '\\times': '\u00D7',
    '\\div': '\u00F7',
    '\\cdot': '\u00B7',
    '\\pi': '\u03C0',
    '\\theta': '\u03B8',
    '\\Delta': '\u0394',
    '\\sum': '\u03A3',
    '\\sin': 'sin',
    '\\cos': 'cos',
    '\\tan': 'tan',
    '\\circ': '\u00B0',
    '\\Leftrightarrow': '\u21D4',
    '\\to': '\u2192',
    '\\leq': '\u2264',
    '\\geq': '\u2265',
    '\\neq': '\u2260',
    '\\%': '%',
    '\\;': ' ',
    '\\,': ' ',
    '\\ ': ' ',
  }
  for (const [tex, rep] of Object.entries(symbols)) {
    s = s.split(tex).join(rep)
  }

  // Superscripts: ^2 -> ², ^3 -> ³, ^t -> ^t (leave generic), remove braces
  s = s.replace(/\^\{([^{}]*)\}/g, '^$1')
  s = s.replace(/\^2/g, '\u00B2').replace(/\^3/g, '\u00B3')
  // Subscripts: _1 -> ₁ etc, strip braces
  s = s.replace(/_\{([^{}]*)\}/g, '_$1')
  const subs: Record<string, string> = {
    _0: '\u2080',
    _1: '\u2081',
    _2: '\u2082',
    _3: '\u2083',
  }
  for (const [k, v] of Object.entries(subs)) s = s.split(k).join(v)

  // Remove any leftover backslashes and stray braces
  s = s.replace(/\\/g, '').replace(/[{}]/g, '')
  // Collapse extra whitespace
  s = s.replace(/\s+/g, ' ').trim()
  return s
}

/**
 * Builds and downloads a printable SAT formula & rule sheet PDF from
 * FORMULA_GROUPS. Runs entirely client-side.
 */
export function downloadFormulaSheetPdf(): void {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 48
  const contentWidth = pageWidth - margin * 2
  let y = margin

  function ensureSpace(needed: number) {
    if (y + needed > pageHeight - margin) {
      doc.addPage()
      y = margin
    }
  }

  // Title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text('SAT Formula & Rule Sheet', margin, y)
  y += 22
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(120)
  doc.text(
    'Every must-know SAT math formula and grammar rule in one place.',
    margin,
    y,
  )
  doc.setTextColor(0)
  y += 24

  for (const group of FORMULA_GROUPS) {
    ensureSpace(40)

    // Category heading
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.text(group.category, margin, y)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(140)
    doc.text(group.section, pageWidth - margin, y, { align: 'right' })
    doc.setTextColor(0)
    y += 8

    // Divider
    doc.setDrawColor(220)
    doc.line(margin, y, pageWidth - margin, y)
    y += 16

    for (const f of group.formulas) {
      const expr = latexToPlain(f.expression)
      const exprLines = doc.splitTextToSize(expr, contentWidth - 12)
      const noteLines = doc.splitTextToSize(f.note, contentWidth - 12)
      const blockHeight = 16 + exprLines.length * 13 + noteLines.length * 12 + 8
      ensureSpace(blockHeight)

      // Formula name
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text(f.name, margin, y)
      y += 14

      // Expression
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.setTextColor(30)
      doc.text(exprLines, margin + 12, y)
      y += exprLines.length * 13

      // Note
      doc.setFontSize(9)
      doc.setTextColor(120)
      doc.text(noteLines, margin + 12, y)
      y += noteLines.length * 12 + 10
      doc.setTextColor(0)
    }

    y += 8
  }

  doc.save('sat-formula-sheet.pdf')
}
