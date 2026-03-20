/**
 * Assembles the full laudo text from its parts.
 * Pure function — no side effects.
 */
export function assembleText(introducao, diseases, conclusao, paciente) {
  const sections = []

  if (introducao && introducao.trim()) {
    sections.push(introducao.trim())
  }

  for (const disease of diseases) {
    const resolved = disease.descricao
      .replace(/\{\{nome_paciente\}\}/g, paciente?.nome || 'periciando(a)')
      .replace(/\{\{codigo\}\}/g, disease.codigo)

    sections.push(`[${disease.codigo}] ${disease.nome}\n\n${resolved}`)
  }

  if (conclusao && conclusao.trim()) {
    sections.push(conclusao.trim())
  }

  return sections.join('\n\n' + '─'.repeat(60) + '\n\n')
}

/**
 * Generates a sequential laudo number.
 */
export function generateLaudoNumber(counter) {
  const year = new Date().getFullYear()
  return `LAU-${year}-${String(counter).padStart(4, '0')}`
}
