/**
 * Exportação para Word (.docx) usando a biblioteca `docx`.
 * Converte o HTML do editor TipTap em um arquivo .docx formatado.
 *
 * Estratégia: DOMParser (nativo do browser) → percorre o DOM e converte
 * cada elemento em objetos do docx (Paragraph, TextRun, etc.)
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  convertMillimetersToTwip,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from 'docx'
import { saveAs } from 'file-saver'

// ── Conversor de HTML → docx ────────────────────────────────────────────────

/**
 * Converte um único nó DOM em um array de TextRun (runs de texto formatado).
 */
function nodeToRuns(node, inherited = {}) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent
    if (!text) return []
    return [new TextRun({ text, ...inherited })]
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return []

  const tag = node.tagName.toLowerCase()
  const styles = { ...inherited }

  if (tag === 'strong' || tag === 'b') styles.bold = true
  if (tag === 'em' || tag === 'i') styles.italics = true
  if (tag === 'u') styles.underline = { type: 'single' }
  if (tag === 's' || tag === 'strike') styles.strike = true
  if (tag === 'br') return [new TextRun({ text: '', break: 1 })]

  const runs = []
  for (const child of node.childNodes) {
    runs.push(...nodeToRuns(child, styles))
  }
  return runs
}

/**
 * Mapeia um elemento de bloco (p, h1-h4, li) em um Paragraph do docx.
 */
function elementToParagraph(el, options = {}) {
  const tag = el.tagName?.toLowerCase() ?? ''
  const runs = nodeToRuns(el)

  // Alinhamento via TipTap (style="text-align:...")
  let alignment = AlignmentType.LEFT
  const style = el.getAttribute?.('style') || ''
  if (style.includes('text-align: center') || style.includes('text-align:center')) alignment = AlignmentType.CENTER
  if (style.includes('text-align: right') || style.includes('text-align:right')) alignment = AlignmentType.END
  if (style.includes('text-align: justify') || style.includes('text-align:justify')) alignment = AlignmentType.BOTH

  const base = { children: runs, alignment, ...options }

  const headingMap = {
    h1: HeadingLevel.HEADING_1,
    h2: HeadingLevel.HEADING_2,
    h3: HeadingLevel.HEADING_3,
    h4: HeadingLevel.HEADING_4,
  }

  if (headingMap[tag]) {
    return new Paragraph({ ...base, heading: headingMap[tag] })
  }

  return new Paragraph(base)
}

/**
 * Processa um nó de lista (ul/ol) e retorna Paragraphs com bullet/numero.
 */
function listToParagraphs(listEl) {
  const isOrdered = listEl.tagName.toLowerCase() === 'ol'
  const paragraphs = []

  const items = Array.from(listEl.querySelectorAll(':scope > li'))
  items.forEach((li, idx) => {
    const runs = nodeToRuns(li)
    const prefix = isOrdered ? `${idx + 1}. ` : '• '
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: prefix }), ...runs],
        indent: { left: convertMillimetersToTwip(10) },
      }),
    )
  })

  return paragraphs
}

/**
 * Percorre o corpo do HTML e converte cada elemento em Paragraphs/Tables.
 */
function bodyToParagraphs(bodyEl) {
  const paragraphs = []

  for (const child of bodyEl.children) {
    const tag = child.tagName.toLowerCase()

    if (['p', 'h1', 'h2', 'h3', 'h4'].includes(tag)) {
      paragraphs.push(elementToParagraph(child))
      continue
    }

    if (tag === 'ul' || tag === 'ol') {
      paragraphs.push(...listToParagraphs(child))
      continue
    }

    if (tag === 'hr') {
      paragraphs.push(
        new Paragraph({
          children: [],
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC' },
          },
        }),
      )
      continue
    }

    if (tag === 'blockquote') {
      paragraphs.push(
        new Paragraph({
          children: nodeToRuns(child),
          indent: { left: convertMillimetersToTwip(12) },
          border: {
            left: { style: BorderStyle.SINGLE, size: 12, color: '1E40AF' },
          },
        }),
      )
      continue
    }

    // Elemento genérico: extrair como parágrafo simples
    const runs = nodeToRuns(child)
    if (runs.length > 0) {
      paragraphs.push(new Paragraph({ children: runs }))
    }
  }

  return paragraphs
}

// ── Bloco de assinatura ──────────────────────────────────────────────────────

function buildSignatureParagraphs(medicoNome, crm) {
  return [
    new Paragraph({ children: [] }),
    new Paragraph({ children: [] }),
    new Paragraph({
      children: [new TextRun({ text: '___________________________________________________' })],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [new TextRun({ text: `Dr(a). ${medicoNome}`, bold: true })],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [new TextRun({ text: `Médico(a) Perito(a) - CRM ${crm}` })],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Documento preparado para assinatura digital via token (e-CPF/PJeOffice). A validação criptográfica ocorrerá no ato do envio ao portal do tribunal.',
          italics: true,
          size: 20, // 10pt em half-points
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),
  ]
}

// ── Exportação principal ──────────────────────────────────────────────────────

/**
 * Exporta o conteúdo HTML para um arquivo Word (.docx).
 *
 * @param {Object} params
 * @param {string} params.htmlContent - HTML do editor TipTap
 * @param {string} params.medicoNome - Nome do médico perito
 * @param {string} params.crm - CRM do médico
 * @param {string} [params.fileName='laudo.docx'] - Nome do arquivo
 */
export async function exportToDocx({ htmlContent, medicoNome, crm, fileName = 'laudo.docx' }) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlContent, 'text/html')

  const contentParagraphs = bodyToParagraphs(doc.body)
  const signatureParagraphs = buildSignatureParagraphs(medicoNome, crm)

  const docx = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: convertMillimetersToTwip(210), // A4 largura
              height: convertMillimetersToTwip(297), // A4 altura
            },
            // Margens PJe: superior 3cm, esquerda 3cm, inferior 2cm, direita 2cm
            margin: {
              top: convertMillimetersToTwip(30),
              left: convertMillimetersToTwip(30),
              bottom: convertMillimetersToTwip(20),
              right: convertMillimetersToTwip(20),
            },
          },
        },
        children: [...contentParagraphs, ...signatureParagraphs],
      },
    ],
    styles: {
      default: {
        document: {
          run: {
            size: 24, // 12pt em half-points
            font: 'Arial',
          },
        },
      },
    },
  })

  const buffer = await Packer.toBuffer(docx)
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })
  saveAs(blob, fileName)
}
