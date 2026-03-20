import { Outlet } from 'react-router-dom'
import Sidebar from '../Sidebar/Sidebar'
import Topbar from '../Topbar/Topbar'
import styles from './MainLayout.module.css'

export default function MainLayout() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <Topbar />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
