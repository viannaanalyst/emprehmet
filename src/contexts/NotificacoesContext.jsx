import { createContext, useContext, useState } from 'react'
import { read, write, KEYS } from '../utils/storage'
import { v4 as uuidv4 } from 'uuid'

const NotificacoesContext = createContext(null)

// ── Seed de demonstração ─────────────────────────────────────────────────────
const SEED_NOTIFICACOES = [
  {
    id: 'seed-1',
    tipo: 'nova_pericia',
    processo: '1001234-55.2024.8.26.0001',
    tribunal: 'TJSP – 5ª Vara Cível de São Paulo',
    assunto: '[PJe] Nova perícia médica atribuída – Processo 1001234-55.2024.8.26.0001',
    resumo: 'Vossa Senhoria foi designado como perito médico para o processo acima. Prazo para apresentação do laudo: 30 dias.',
    origemEmail: 'noreply@pje.tjsp.jus.br',
    dataRecebimento: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h atrás
    prazo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    urgente: false,
    lida: false,
    laudoId: null,
  },
  {
    id: 'seed-2',
    tipo: 'intimacao',
    processo: '0987654-32.2023.8.26.0050',
    tribunal: 'TJSP – 2ª Vara de Acidentes do Trabalho',
    assunto: '[PJe] Intimação – Complementação de laudo pericial',
    resumo: 'O MM. Juiz determinou a complementação do laudo pericial apresentado. Prazo: 10 dias úteis.',
    origemEmail: 'noreply@pje.tjsp.jus.br',
    dataRecebimento: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), // 26h atrás
    prazo: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    urgente: false,
    lida: false,
    laudoId: null,
  },
  {
    id: 'seed-3',
    tipo: 'prazo',
    processo: '5544332-11.2023.8.26.0100',
    tribunal: 'TJSP – 7ª Vara Cível',
    assunto: '[PJe] URGENTE – Prazo do laudo vence em 2 dias',
    resumo: 'Atenção: O prazo para entrega do laudo pericial no processo acima vence em 2 dias. Apresentação obrigatória.',
    origemEmail: 'noreply@pje.tjsp.jus.br',
    dataRecebimento: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias atrás
    prazo: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    urgente: true,
    lida: true,
    laudoId: null,
  },
]

const CONFIG_DEFAULT = {
  emailMedico: '',
  ativo: false,
  filtrarSoNaoLidas: false,
  filtrarTipo: 'todos',
}

// ── Provider ─────────────────────────────────────────────────────────────────
export function NotificacoesProvider({ children }) {
  const [notificacoes, setNotificacoes] = useState(() => {
    const stored = read(KEYS.NOTIFICACOES)
    if (stored && stored.length > 0) return stored
    write(KEYS.NOTIFICACOES, SEED_NOTIFICACOES)
    return SEED_NOTIFICACOES
  })

  const [config, setConfig] = useState(() => {
    return read(KEYS.EMAIL_CONFIG) || CONFIG_DEFAULT
  })

  function persistNotifs(updated) {
    setNotificacoes(updated)
    write(KEYS.NOTIFICACOES, updated)
  }

  function persistConfig(updated) {
    setConfig(updated)
    write(KEYS.EMAIL_CONFIG, updated)
  }

  // ── Ações de notificações ──
  function marcarLida(id) {
    persistNotifs(notificacoes.map(n => n.id === id ? { ...n, lida: true } : n))
  }

  function marcarTodasLidas() {
    persistNotifs(notificacoes.map(n => ({ ...n, lida: true })))
  }

  function excluirNotificacao(id) {
    persistNotifs(notificacoes.filter(n => n.id !== id))
  }

  function vincularLaudo(notifId, laudoId) {
    persistNotifs(notificacoes.map(n => n.id === notifId ? { ...n, laudoId, lida: true } : n))
  }

  /** Simula o recebimento de um e-mail do PJe (para testes) */
  function simularRecebimento(dados) {
    const nova = {
      id: uuidv4(),
      tipo: dados.tipo || 'nova_pericia',
      processo: dados.processo || '',
      tribunal: dados.tribunal || '',
      assunto: dados.assunto || '',
      resumo: dados.resumo || '',
      origemEmail: 'noreply@pje.jus.br',
      dataRecebimento: new Date().toISOString(),
      prazo: dados.prazo || null,
      urgente: dados.urgente || false,
      lida: false,
      laudoId: null,
    }
    persistNotifs([nova, ...notificacoes])
    return nova
  }

  // ── Config ──
  function salvarConfig(patch) {
    persistConfig({ ...config, ...patch })
  }

  const naoLidas = notificacoes.filter(n => !n.lida).length

  return (
    <NotificacoesContext.Provider value={{
      notificacoes,
      config,
      naoLidas,
      marcarLida,
      marcarTodasLidas,
      excluirNotificacao,
      vincularLaudo,
      simularRecebimento,
      salvarConfig,
    }}>
      {children}
    </NotificacoesContext.Provider>
  )
}

export function useNotificacoes() {
  const ctx = useContext(NotificacoesContext)
  if (!ctx) throw new Error('useNotificacoes must be used within NotificacoesProvider')
  return ctx
}
