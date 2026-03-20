import { useState } from 'react'
import { useLaudos } from '../../contexts/LaudoContext'
import { StatusBadge } from '../../components/ui/Badge/Badge'
import Modal from '../../components/ui/Modal/Modal'
import LaudoPreview from '../../components/laudo/LaudoPreview/LaudoPreview'
import Button from '../../components/ui/Button/Button'
import { TypographyH1, TypographyMuted } from '@/components/ui/typography'
import { motion } from 'framer-motion'
import { ClipboardCheck } from 'lucide-react'

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
  const [confirmAction, setConfirmAction] = useState(null)

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
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 mb-1"
      >
        <ClipboardCheck className="w-7 h-7 text-primary" />
        <TypographyH1 className="text-2xl lg:text-3xl">
          Verificar Laudos
        </TypographyH1>
      </motion.div>
      <TypographyMuted>
        Gerencie o andamento e status dos laudos
      </TypographyMuted>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {COLUMNS.map(col => {
          const items = byStatus(col.status)
          return (
            <div key={col.status} className="bg-muted rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-muted-foreground/10 border-b border-border">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {col.label}
                </span>
                <span className="w-6 h-6 bg-muted-foreground/30 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {items.length}
                </span>
              </div>
              <div className="p-3 flex flex-col gap-3 min-h-[80px]">
                {items.length === 0 && (
                  <p className="text-xs text-muted-foreground/50 text-center py-4">
                    Nenhum laudo
                  </p>
                )}
                {items.map(laudo => (
                  <motion.div
                    key={laudo.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-card border border-border rounded p-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-primary font-mono">
                        {laudo.numero}
                      </span>
                      <StatusBadge status={laudo.status} />
                    </div>
                    <p className="text-sm font-semibold text-foreground mb-1">
                      {laudo.paciente?.nome || '—'}
                    </p>
                    {laudo.paciente?.processo && (
                      <p className="text-xs text-muted-foreground mb-1">
                        {laudo.paciente.processo}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground/70 mb-3">
                      {laudo.criadoEm ? new Date(laudo.criadoEm).toLocaleDateString('pt-BR') : '—'}
                    </p>
                    <div className="flex flex-col gap-2">
                      <button
                        className="w-full px-3 py-2 text-xs bg-transparent border border-border rounded hover:bg-muted transition-colors"
                        onClick={() => setSelectedLaudo(laudo)}
                      >
                        Ver
                      </button>
                      {STATUS_NEXT[laudo.status] && (
                        <button
                          className="w-full px-3 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                          onClick={() => handleAdvance(laudo)}
                        >
                          {STATUS_NEXT[laudo.status]}
                        </button>
                      )}
                      {STATUS_PREV[laudo.status] && (
                        <button
                          className="w-full px-3 py-2 text-xs border border-border rounded hover:bg-muted transition-colors"
                          onClick={() => setConfirmAction({ laudo, type: 'revert' })}
                        >
                          {STATUS_PREV[laudo.status]}
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )
        })}
      </motion.div>

      <Modal
        isOpen={!!selectedLaudo}
        onClose={() => setSelectedLaudo(null)}
        title={selectedLaudo ? `Laudo ${selectedLaudo.numero}` : ''}
        size="lg"
      >
        <LaudoPreview laudo={selectedLaudo} />
      </Modal>

      <Modal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title="Confirmar ação"
        size="sm"
      >
        <p className="text-sm text-muted-foreground mb-5">
          {confirmAction?.type === 'advance' && confirmAction?.laudo?.status === 'concluido'
            ? 'Deseja arquivar este laudo? Esta ação é irreversível.'
            : 'Confirma a alteração de status deste laudo?'}
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="cancel" onClick={() => setConfirmAction(null)}>Cancelar</Button>
          <Button
            variant={confirmAction?.type === 'advance' && confirmAction?.laudo?.status === 'concluido' ? 'destructive' : 'default'}
            onClick={handleConfirm}
          >
            Confirmar
          </Button>
        </div>
      </Modal>
    </motion.div>
  )
}
