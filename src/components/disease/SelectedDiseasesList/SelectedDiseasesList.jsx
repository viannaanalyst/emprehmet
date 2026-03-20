import styles from './SelectedDiseasesList.module.css'

export default function SelectedDiseasesList({ diseases, onRemove }) {
  if (diseases.length === 0) {
    return (
      <div className={styles.empty}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--grey-300)', marginBottom: 8 }}>
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p>Nenhuma condição selecionada.</p>
        <p>Use a biblioteca ao lado para adicionar condições ao laudo.</p>
      </div>
    )
  }

  return (
    <div className={styles.list}>
      {diseases.map((d, idx) => (
        <div key={d.id} className={styles.item}>
          <div className={styles.itemHeader}>
            <span className={styles.order}>{idx + 1}</span>
            <span className={styles.code}>{d.codigo}</span>
            <span className={styles.name}>{d.nome}</span>
            <button className={styles.removeBtn} onClick={() => onRemove(d.id)} title="Remover">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <p className={styles.desc}>{d.descricao.slice(0, 160)}...</p>
        </div>
      ))}
    </div>
  )
}
