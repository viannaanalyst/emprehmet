import { useState } from 'react'
import { useLaudos } from '../../contexts/LaudoContext'
import { StatusBadge } from '../../components/ui/Badge/Badge'
import Modal from '../../components/ui/Modal/Modal'
import LaudoPreview from '../../components/laudo/LaudoPreview/LaudoPreview'
import Button from '../../components/ui/Button/Button'
import styles from './VerificarLaudosPage.module.css'

const COLUMNS = [
  { status: 'rascunho', label: 'Rascunho' },
  { status: 'em_analise', label: 'Em Análise' },
  { status: 'concluido', label: 'Concluído' },
  { status: 'arquivado', label: 'Arquivado' },
]

const STATUS_NEXT = {
  rascunho: 'Enviar para Análise',
  em_analise: 'Marcar como Concluído',
  concluido: 'Arquivar',
}

const STATUS_PREV = {
  em_analise: 'Voltar para Rascunho',
  concluido: 'Voltar para Análise',
}

export default function VerificarLaudosPage() {
  const { laudos, advanceStatus, revertStatus } = useLaudos()
  const [selectedLaudo, setSelectedLaudo] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null) // { laudo, type: 'advance' | 'revert' }

  const byStatus = (status) => laudos.filter(l => l.status === status)

  function handleAdvance(laudo) {
    if (laudo.status === 'concluido') {
      setConfirmAction({ laudo, type: 'advance' })
    } else {
      advanceStatus(laudo.id)
    }
  }

  function handleConfirm() {
    if (confirmAction?.type === 'advance') advanceStatus(confirmAction.laudo.id)
    if (confirmAction?.type === 'revert') revertStatus(confirmAction.laudo.id)
    setConfirmAction(null)
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Verificar Laudos</h1>
        <p className={styles.sub}>Gerencie o andamento e status dos laudos</p>
      </div>

      <div className={styles.kanban}>
        {COLUMNS.map(col => {
          const items = byStatus(col.status)
          return (
            <div key={col.status} className={styles.column}>
              <div className={styles.colHeader}>
                <span className={styles.colTitle}>{col.label}</span>
                <span className={styles.colCount}>{items.length}</span>
              </div>
              <div className={styles.colBody}>
                {items.length === 0 && (
                  <p className={styles.empty}>Nenhum laudo</p>
                )}
                {items.map(laudo => (
                  <div key={laudo.id} className={styles.kanbanCard}>
                    <div className={styles.cardTop}>
                      <span className={styles.cardNum}>{laudo.numero}</span>
                      <StatusBadge status={laudo.status} />
                    </div>
                    <p className={styles.cardPatient}>{laudo.paciente?.nome || '—'}</p>
                    {laudo.paciente?.processo && (
                      <p className={styles.cardProcess}>{laudo.paciente.processo}</p>
                    )}
                    <p className={styles.cardDate}>
                      {laudo.criadoEm ? new Date(laudo.criadoEm).toLocaleDateString('pt-BR') : '—'}
                    </p>
                    <div className={styles.cardActions}>
                      <button className={styles.viewBtn} onClick={() => setSelectedLaudo(laudo)}>
                        Ver
                      </button>
                      {STATUS_NEXT[laudo.status] && (
                        <button className={styles.advanceBtn} onClick={() => handleAdvance(laudo)}>
                          {STATUS_NEXT[laudo.status]}
                        </button>
                      )}
                      {STATUS_PREV[laudo.status] && (
                        <button className={styles.revertBtn} onClick={() => setConfirmAction({ laudo, type: 'revert' })}>
                          {STATUS_PREV[laudo.status]}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Preview modal */}
      <Modal
        isOpen={!!selectedLaudo}
        onClose={() => setSelectedLaudo(null)}
        title={selectedLaudo ? `Laudo ${selectedLaudo.numero}` : ''}
        size="lg"
      >
        <LaudoPreview laudo={selectedLaudo} />
      </Modal>

      {/* Confirm action modal */}
      <Modal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title="Confirmar ação"
        size="sm"
      >
        <p style={{ marginBottom: 20, fontSize: '0.9rem', color: 'var(--grey-700)', lineHeight: 1.6 }}>
          {confirmAction?.type === 'advance' && confirmAction?.laudo?.status === 'concluido'
            ? 'Deseja arquivar este laudo? Esta ação é irreversível.'
            : 'Confirma a alteração de status deste laudo?'}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="outline" onClick={() => setConfirmAction(null)}>Cancelar</Button>
          <Button
            variant={confirmAction?.type === 'advance' && confirmAction?.laudo?.status === 'concluido' ? 'danger' : 'primary'}
            onClick={handleConfirm}
          >
            Confirmar
          </Button>
        </div>
      </Modal>
    </div>
  )
}
