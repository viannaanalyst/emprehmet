import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLaudos } from '../../contexts/LaudoContext'
import LaudoForm from '../../components/laudo/LaudoForm/LaudoForm'
import Modal from '../../components/ui/Modal/Modal'
import LaudoPreview from '../../components/laudo/LaudoPreview/LaudoPreview'
import Button from '../../components/ui/Button/Button'
import styles from './AtribuirLaudoPage.module.css'

export default function AtribuirLaudoPage() {
  const { createLaudo } = useLaudos()
  const navigate = useNavigate()
  const [savedLaudo, setSavedLaudo] = useState(null)

  function handleSubmit(formData) {
    const laudo = createLaudo(formData)
    setSavedLaudo(laudo)
  }

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Atribuir Laudo</h1>
          <p className={styles.sub}>Preencha os dados e selecione as condições da perícia</p>
        </div>
      </div>

      <LaudoForm onSubmit={handleSubmit} />

      {/* Success modal */}
      <Modal
        isOpen={!!savedLaudo}
        onClose={() => { setSavedLaudo(null); navigate('/visualizacao') }}
        title="Laudo salvo com sucesso!"
        size="lg"
      >
        <div className={styles.successMsg}>
          <div className={styles.successIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div>
            <p className={styles.successTitle}>
              Laudo <strong>{savedLaudo?.numero}</strong> criado com sucesso!
            </p>
            <p className={styles.successStatus}>
              Status: <strong>{savedLaudo?.status === 'rascunho' ? 'Rascunho' : 'Em Análise'}</strong>
            </p>
          </div>
        </div>
        <LaudoPreview laudo={savedLaudo} />
        <div className={styles.successActions}>
          <Button variant="outline" onClick={() => { setSavedLaudo(null) }}>
            Criar novo laudo
          </Button>
          <Button variant="secondary" onClick={() => { setSavedLaudo(null); navigate('/visualizacao') }}>
            Ver todos os laudos
          </Button>
          <Button variant="primary" onClick={() => navigate(`/revisar-laudo/${savedLaudo?.id}`)}>
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
