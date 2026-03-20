import styles from './LaudoPreview.module.css'

export default function LaudoPreview({ laudo }) {
  if (!laudo) return null

  const { numero, paciente, peritoNome, textoLaudo, doencasSelecionadas, criadoEm, status } = laudo

  return (
    <div className={styles.preview}>
      <div className={styles.meta}>
        {numero && <div className={styles.metaRow}><span>Número:</span><strong>{numero}</strong></div>}
        {paciente?.nome && <div className={styles.metaRow}><span>Paciente:</span><strong>{paciente.nome}</strong></div>}
        {paciente?.cpf && <div className={styles.metaRow}><span>CPF:</span><strong>{paciente.cpf}</strong></div>}
        {paciente?.processo && <div className={styles.metaRow}><span>Processo:</span><strong>{paciente.processo}</strong></div>}
        {peritoNome && <div className={styles.metaRow}><span>Perito:</span><strong>{peritoNome}</strong></div>}
        {criadoEm && <div className={styles.metaRow}><span>Data:</span><strong>{new Date(criadoEm).toLocaleDateString('pt-BR')}</strong></div>}
        {doencasSelecionadas?.length > 0 && (
          <div className={styles.metaRow}>
            <span>Condições ({doencasSelecionadas.length}):</span>
            <span style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {doencasSelecionadas.map(d => (
                <span key={d.id} style={{ fontSize: '0.75rem', background: 'var(--primary-lighter)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 999, fontWeight: 600 }}>
                  {d.codigo}
                </span>
              ))}
            </span>
          </div>
        )}
      </div>
      <div className={styles.divider} />
      <pre className={styles.text}>{textoLaudo || '(sem conteúdo)'}</pre>
    </div>
  )
}
