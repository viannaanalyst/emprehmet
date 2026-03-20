import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLaudos } from '../../contexts/LaudoContext'
import LaudoForm from '../../components/laudo/LaudoForm/LaudoForm'
import Modal from '../../components/ui/Modal/Modal'
import LaudoPreview from '../../components/laudo/LaudoPreview/LaudoPreview'
import Button from '../../components/ui/Button/Button'
import { TypographyH1, TypographyMuted, TypographySmall } from '@/components/ui/typography'
import { motion } from 'framer-motion'
import { FileText, Check } from 'lucide-react'

export default function AtribuirLaudoPage() {
  const { createLaudo } = useLaudos()
  const navigate = useNavigate()
  const [savedLaudo, setSavedLaudo] = useState(null)

  function handleSubmit(formData) {
    const laudo = createLaudo(formData)
    setSavedLaudo(laudo)
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
        <FileText className="w-7 h-7 text-primary" />
        <TypographyH1 className="text-2xl lg:text-3xl">
          Atribuir Laudo
        </TypographyH1>
      </motion.div>
      <TypographyMuted>
        Preencha os dados e selecione as condições da perícia
      </TypographyMuted>

      <LaudoForm onSubmit={handleSubmit} />

      <Modal
        isOpen={!!savedLaudo}
        onClose={() => { setSavedLaudo(null); navigate('/visualizacao') }}
        title="Laudo salvo com sucesso!"
        size="lg"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-4 p-4 bg-success/10 border border-success/20 rounded-lg mb-5"
        >
          <div className="w-12 h-12 bg-success text-success-foreground rounded-full flex items-center justify-center flex-shrink-0">
            <Check className="w-6 h-6" />
          </div>
          <div>
            <TypographySmall className="font-medium text-foreground mb-0.5">
              Laudo <strong>{savedLaudo?.numero}</strong> criado com sucesso!
            </TypographySmall>
            <TypographyMuted>
              Status: <strong className="text-foreground">{savedLaudo?.status === 'rascunho' ? 'Rascunho' : 'Em Análise'}</strong>
            </TypographyMuted>
          </div>
        </motion.div>

        <LaudoPreview laudo={savedLaudo} />

        <div className="flex justify-end gap-3 mt-5 pt-4 border-t">
          <Button variant="outline" onClick={() => { setSavedLaudo(null) }}>
            Criar novo laudo
          </Button>
          <Button variant="secondary" onClick={() => { setSavedLaudo(null); navigate('/visualizacao') }}>
            Ver todos os laudos
          </Button>
          <Button variant="default" onClick={() => navigate(`/revisar-laudo/${savedLaudo?.id}`)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Revisar e Finalizar (PDF / Word)
          </Button>
        </div>
      </Modal>
    </motion.div>
  )
}
