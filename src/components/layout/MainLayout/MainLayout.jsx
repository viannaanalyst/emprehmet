import { Outlet } from 'react-router-dom'
import Sidebar from '../Sidebar/Sidebar'
import Topbar from '../Topbar/Topbar'
import { useSidebar } from '../../../contexts/SidebarContext'
import styles from './MainLayout.module.css'

export default function MainLayout() {
  const { collapsed } = useSidebar()

  return (
    <div className={`${styles.layout} ${collapsed ? styles.sidebarCollapsed : ''}`}>
      <Sidebar />
      <Topbar />
      <main className={styles.main}>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
