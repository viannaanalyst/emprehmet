import { useNavigate } from 'react-router-dom'
import { useLaudos } from '../../contexts/LaudoContext'
import { useAuth } from '../../contexts/AuthContext'
import styles from './DashboardPage.module.css'

function StatCard({ label, value, color, icon }) {
  return (
    <div className={`${styles.statCard} ${styles[color]}`}>
      <div className={styles.statIcon}>{icon}</div>
      <div>
        <p className={styles.statValue}>{value}</p>
        <p className={styles.statLabel}>{label}</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { laudos } = useLaudos()
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const total = laudos.length
  const rascunhos = laudos.filter(l => l.status === 'rascunho').length
  const emAnalise = laudos.filter(l => l.status === 'em_analise').length
  const concluidos = laudos.filter(l => l.status === 'concluido').length
  const arquivados = laudos.filter(l => l.status === 'arquivado').length

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.welcome}>Bem-vindo(a), {currentUser?.nome}.</p>
        </div>
        <button className={styles.newBtn} onClick={() => navigate('/atribuir-laudo')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Novo Laudo
        </button>
      </div>

      <div className={styles.statsGrid}>
        <StatCard label="Total de Laudos" value={total} color="blue" icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        } />
        <StatCard label="Rascunhos" value={rascunhos} color="grey" icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        } />
        <StatCard label="Em Análise" value={emAnalise} color="yellow" icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        } />
        <StatCard label="Concluídos" value={concluidos} color="green" icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        } />
      </div>

      <div className={styles.quickActions}>
        <h2 className={styles.subtitle}>Acesso Rápido</h2>
        <div className={styles.actionsGrid}>
          <button className={styles.actionCard} onClick={() => navigate('/visualizacao')}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <span>Visualizar Laudos</span>
            <p>Consulte todos os laudos cadastrados</p>
          </button>
          <button className={styles.actionCard} onClick={() => navigate('/verificar-laudos')}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 11 12 14 22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            <span>Verificar Laudos</span>
            <p>Gerencie o status e andamento dos laudos</p>
          </button>
          <button className={styles.actionCard} onClick={() => navigate('/atribuir-laudo')}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            <span>Novo Laudo</span>
            <p>Crie um novo laudo pericial</p>
          </button>
        </div>
      </div>
    </div>
  )
}
