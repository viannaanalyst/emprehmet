import { StatusBadge } from '../../ui/Badge/Badge'
import styles from './LaudoCard.module.css'

export default function LaudoCard({ laudo, onClick }) {
  const { numero, paciente, peritoNome, status, criadoEm, doencasSelecionadas } = laudo

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.top}>
        <span className={styles.number}>{numero}</span>
        <StatusBadge status={status} />
      </div>
      <p className={styles.patient}>{paciente?.nome || '—'}</p>
      {paciente?.processo && (
        <p className={styles.processo}>Processo: {paciente.processo}</p>
      )}
      <div className={styles.footer}>
        <span className={styles.meta}>
          {doencasSelecionadas?.length > 0
            ? `${doencasSelecionadas.length} condição(ões)`
            : 'Sem condições'}
        </span>
        <span className={styles.meta}>
          {criadoEm ? new Date(criadoEm).toLocaleDateString('pt-BR') : '—'}
        </span>
      </div>
    </div>
  )
}
