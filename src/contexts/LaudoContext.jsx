import { createContext, useContext, useState } from 'react'
import { read, write, KEYS } from '../utils/storage'
import { assembleText, generateLaudoNumber } from '../utils/laudoBuilder'
import { useAuth } from './AuthContext'
import { v4 as uuidv4 } from 'uuid'

const LaudoContext = createContext(null)

const STATUS_FLOW = ['rascunho', 'em_analise', 'concluido', 'arquivado']

export function LaudoProvider({ children }) {
  const { currentUser } = useAuth()
  const [laudos, setLaudos] = useState(() => read(KEYS.LAUDOS) || [])

  function persist(updated) {
    setLaudos(updated)
    write(KEYS.LAUDOS, updated)
  }

  function nextCounter() {
    const current = read(KEYS.LAUDO_COUNTER) || 0
    const next = current + 1
    write(KEYS.LAUDO_COUNTER, next)
    return next
  }

  function createLaudo({ paciente, introducao, doencasSelecionadas, conclusao, status = 'rascunho' }) {
    const counter = nextCounter()
    const now = new Date().toISOString()
    const textoLaudo = assembleText(introducao, doencasSelecionadas, conclusao, paciente)

    const laudo = {
      id: uuidv4(),
      numero: generateLaudoNumber(counter),
      status,
      paciente,
      peritoId: currentUser?.id,
      peritoNome: currentUser?.nome || 'Desconhecido',
      doencasSelecionadas,
      introducao,
      conclusao,
      textoLaudo,
      criadoEm: now,
      atualizadoEm: now,
      concluidoEm: null,
    }

    persist([...laudos, laudo])
    return laudo
  }

  function updateLaudo(id, patch) {
    const updated = laudos.map(l => {
      if (l.id !== id) return l
      const merged = { ...l, ...patch, atualizadoEm: new Date().toISOString() }
      // Rebuild textoLaudo if content fields changed
      if (patch.introducao !== undefined || patch.doencasSelecionadas !== undefined || patch.conclusao !== undefined) {
        merged.textoLaudo = assembleText(
          merged.introducao,
          merged.doencasSelecionadas,
          merged.conclusao,
          merged.paciente,
        )
      }
      return merged
    })
    persist(updated)
  }

  function deleteLaudo(id) {
    persist(laudos.filter(l => l.id !== id))
  }

  function getLaudoById(id) {
    return laudos.find(l => l.id === id)
  }

  function advanceStatus(id) {
    const laudo = getLaudoById(id)
    if (!laudo) return
    const idx = STATUS_FLOW.indexOf(laudo.status)
    if (idx === -1 || idx === STATUS_FLOW.length - 1) return
    const newStatus = STATUS_FLOW[idx + 1]
    const patch = { status: newStatus }
    if (newStatus === 'concluido') patch.concluidoEm = new Date().toISOString()
    updateLaudo(id, patch)
  }

  function revertStatus(id) {
    const laudo = getLaudoById(id)
    if (!laudo) return
    const idx = STATUS_FLOW.indexOf(laudo.status)
    if (idx <= 0 || laudo.status === 'arquivado') return
    updateLaudo(id, { status: STATUS_FLOW[idx - 1] })
  }

  return (
    <LaudoContext.Provider value={{ laudos, createLaudo, updateLaudo, deleteLaudo, getLaudoById, advanceStatus, revertStatus, STATUS_FLOW }}>
      {children}
    </LaudoContext.Provider>
  )
}

export function useLaudos() {
  const ctx = useContext(LaudoContext)
  if (!ctx) throw new Error('useLaudos must be used within LaudoProvider')
  return ctx
}
