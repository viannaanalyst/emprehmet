import styles from './Badge.module.css'

const STATUS_LABELS = {
  rascunho: 'Rascunho',
  em_analise: 'Em Análise',
  concluido: 'Concluído',
  arquivado: 'Arquivado',
}

export function StatusBadge({ status }) {
  return (
    <span className={`${styles.badge} ${styles[status]}`}>
      {STATUS_LABELS[status] || status}
    </span>
  )
}

export default function Badge({ children, color = 'grey' }) {
  return (
    <span className={`${styles.badge} ${styles[color]}`}>{children}</span>
  )
}
