import styles from './DiseaseCard.module.css'

export default function DiseaseCard({ disease, onAdd, isAdded }) {
  return (
    <div className={`${styles.card} ${isAdded ? styles.added : ''}`}>
      <div className={styles.top}>
        <span className={styles.code}>{disease.codigo}</span>
        <span className={styles.category}>{disease.categoria}</span>
      </div>
      <p className={styles.name}>{disease.nome}</p>
      <p className={styles.preview}>{disease.descricao.slice(0, 120)}...</p>
      <button
        className={`${styles.addBtn} ${isAdded ? styles.addedBtn : ''}`}
        onClick={() => onAdd(disease)}
        disabled={isAdded}
      >
        {isAdded ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Adicionada
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Adicionar
          </>
        )}
      </button>
    </div>
  )
}
