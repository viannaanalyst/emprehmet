/**
 * Exportação para PDF PJe-compatível usando pdfmake (texto real, não imagem).
 *
 * REGRAS CRÍTICAS implementadas:
 *   1. Sem senha, criptografia ou restrições — o docDefinition não contém
 *      userPassword, ownerPassword nem permissions.
 *   2. Texto real e pesquisável — pdfmake gera texto nativo no PDF, nunca canvas.
 *   3. Imagens comprimidas via <canvas> para manter o arquivo abaixo de 3 MB.
 *
 * FONTE: Roboto (embarcada no pdfmake) — equivalente visual ao Arial.
 *   Para usar Times New Roman, instale as fontes e configure pdfMake.fonts.
 *   Exemplo:
 *     pdfMake.fonts = { Times: { normal: 'Times-Roman', bold: 'Times-Bold',
 *                                italics: 'Times-Italic', bolditalics: 'Times-BoldItalic' } }
 *   (requer embed de TTF ou uso de fontes-padrão PDF — ver pdfmake docs)
 */

import pdfMake from 'pdfmake/build/pdfmake'
import vfsFonts from 'pdfmake/build/vfs_fonts'
import htmlToPdfmake from 'html-to-pdfmake'

// Inicializa a VFS uma única vez
let _initialized = false
function ensureInit() {
  if (_initialized) return
  const vfs = vfsFonts?.default ?? vfsFonts
  ;(pdfMake?.default ?? pdfMake).addVirtualFileSystem(vfs)
  _initialized = true
}

function getPdfMake() {
  return pdfMake?.default ?? pdfMake
}

// 1 cm = 28.346 pt
const CM = 28.346

/**
 * Comprime uma imagem de data-URL para JPEG com qualidade reduzida.
 * Garante que imagens pesadas não ultrapassem o limite de 3 MB do PDF.
 *
 * @param {string} dataUrl - data-URL da imagem original
 * @param {number} maxWidth - largura máxima em px (padrão: 1200)
 * @param {number} quality - qualidade JPEG 0–1 (padrão: 0.7)
 * @returns {Promise<string>} data-URL comprimida
 */
async function compressImage(dataUrl, maxWidth = 1200, quality = 0.7) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width)
      const canvas = document.createElement('canvas')
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => resolve(dataUrl) // fallback: manter original se falhar
    img.src = dataUrl
  })
}

/**
 * Processa todas as <img> de um HTML, comprimindo data-URLs.
 * Imagens externas (http/https) são mantidas — pdfmake fará o fetch.
 */
async function compressImagesInHtml(html) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const images = doc.querySelectorAll('img[src]')

  for (const img of images) {
    if (img.src.startsWith('data:image')) {
      img.src = await compressImage(img.src)
    }
  }

  return doc.body.innerHTML
}

/**
 * Monta o bloco de assinatura como HTML formatado.
 */
function buildSignatureHtml(medicoNome, crm) {
  return `
    <div style="text-align:center; margin-top:60px; padding-top:20px; border-top:1px solid #ccc;">
      <p style="font-size:14px; margin:4px 0;">___________________________________________________</p>
      <p style="font-size:12px; font-weight:bold; margin:6px 0;">Dr(a). ${medicoNome}</p>
      <p style="font-size:12px; margin:4px 0;">Médico(a) Perito(a) - CRM ${crm}</p>
      <p style="font-size:10px; font-style:italic; margin:10px auto; max-width:500px; line-height:1.5;">
        Documento preparado para assinatura digital via token (e-CPF/PJeOffice).
        A validação criptográfica ocorrerá no ato do envio ao portal do tribunal.
      </p>
    </div>
  `
}

/**
 * Exporta o conteúdo HTML para um PDF A4 no padrão PJe.
 *
 * @param {Object} params
 * @param {string} params.htmlContent - HTML do editor TipTap
 * @param {string} params.medicoNome - Nome do médico perito
 * @param {string} params.crm - CRM do médico
 * @param {string} [params.fileName='laudo.pdf'] - Nome do arquivo baixado
 */
export async function exportToPdf({ htmlContent, medicoNome, crm, fileName = 'laudo.pdf' }) {
  ensureInit()

  // Comprimir imagens antes de converter
  const processedHtml = await compressImagesInHtml(htmlContent)

  // Injetar bloco de assinatura
  const fullHtml = `<div>${processedHtml}</div>${buildSignatureHtml(medicoNome, crm)}`

  // Converter HTML → formato pdfmake (texto REAL, não canvas)
  const content = htmlToPdfmake(fullHtml, {
    removeExtraBlanks: true,
    defaultStyles: {
      p: { margin: [0, 4, 0, 4] },
      h1: { fontSize: 16, bold: true, margin: [0, 8, 0, 4] },
      h2: { fontSize: 14, bold: true, margin: [0, 6, 0, 3] },
      h3: { fontSize: 13, bold: true, margin: [0, 5, 0, 2] },
    },
  })

  const docDefinition = {
    pageSize: 'A4',

    // Margens PJe: superior 3cm, esquerda 3cm, inferior 2cm, direita 2cm
    // pdfmake: [esquerda, superior, direita, inferior]
    pageMargins: [
      3 * CM, // esquerda  3 cm
      3 * CM, // superior  3 cm
      2 * CM, // direita   2 cm
      2 * CM, // inferior  2 cm
    ],

    defaultStyle: {
      font: 'Roboto', // Ver nota no topo do arquivo para Times New Roman
      fontSize: 12,
      lineHeight: 1.5,
    },

    content,

    // ── REGRA CRÍTICA 1 ──────────────────────────────────────────────────────
    // NÃO definir userPassword, ownerPassword ou permissions.
    // O PDF gerado é 100% aberto: sem proteção de leitura, impressão ou edição.
    // ─────────────────────────────────────────────────────────────────────────
  }

  // Dispara o download (async — pdfmake 0.3.x usa Promises internamente)
  const pdfDoc = getPdfMake().createPdf(docDefinition)
  await pdfDoc.download(fileName)
}
