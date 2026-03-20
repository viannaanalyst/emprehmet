import { useAuth } from '../../../contexts/AuthContext'
import styles from './Topbar.module.css'

export default function Topbar() {
  const { currentUser, logout } = useAuth()

  return (
    <header className={styles.topbar}>
      <div className={styles.spacer} />
      <div className={styles.user}>
        <div className={styles.avatar}>
          {currentUser?.nome?.charAt(0).toUpperCase() || 'U'}
        </div>
        <span className={styles.userName}>{currentUser?.nome}</span>
        <button className={styles.logoutBtn} onClick={logout} title="Sair">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sair
        </button>
      </div>
    </header>
  )
}
