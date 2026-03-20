import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLaudos } from '../../contexts/LaudoContext'
import LaudoCard from '../../components/laudo/LaudoCard/LaudoCard'
import Modal from '../../components/ui/Modal/Modal'
import LaudoPreview from '../../components/laudo/LaudoPreview/LaudoPreview'
import Button from '../../components/ui/Button/Button'
import styles from './VisualizacaoPage.module.css'

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'rascunho', label: 'Rascunho' },
  { value: 'em_analise', label: 'Em Análise' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'arquivado', label: 'Arquivado' },
]

export default function VisualizacaoPage() {
  const { laudos } = useLaudos()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedLaudo, setSelectedLaudo] = useState(null)

  const filtered = laudos.filter(l => {
    const matchSearch =
      !search ||
      l.paciente?.nome?.toLowerCase().includes(search.toLowerCase()) ||
      l.numero?.toLowerCase().includes(search.toLowerCase()) ||
      l.paciente?.processo?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || l.status === statusFilter
    return matchSearch && matchStatus
  })

  // Sort newest first
  const sorted = [...filtered].sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm))

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Visualização de Laudos</h1>
          <p className={styles.sub}>{laudos.length} laudo(s) no total</p>
        </div>
      </div>

      <div className={styles.filters}>
        <input
          className={styles.search}
          type="text"
          placeholder="Buscar por paciente, número ou processo..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className={styles.select}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {sorted.length === 0 ? (
        <div className={styles.empty}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--grey-300)', marginBottom: 12 }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <p>Nenhum laudo encontrado.</p>
          <p>Utilize "Atribuir Laudo" para criar o primeiro.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {sorted.map(l => (
            <LaudoCard key={l.id} laudo={l} onClick={() => setSelectedLaudo(l)} />
          ))}
        </div>
      )}

      <Modal
        isOpen={!!selectedLaudo}
        onClose={() => setSelectedLaudo(null)}
        title={selectedLaudo ? `Laudo ${selectedLaudo.numero}` : ''}
        size="lg"
      >
        <LaudoPreview laudo={selectedLaudo} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--grey-200)' }}>
          <Button variant="primary" onClick={() => navigate(`/revisar-laudo/${selectedLaudo?.id}`)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Revisar e Finalizar (PDF / Word)
          </Button>
        </div>
      </Modal>
    </div>
  )
}
