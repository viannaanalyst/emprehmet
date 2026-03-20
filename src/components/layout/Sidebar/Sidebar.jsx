import { NavLink } from 'react-router-dom'
import { useNotificacoes } from '../../../contexts/NotificacoesContext'
import { useSidebar } from '../../../contexts/SidebarContext'
import {
  ClipboardCheck,
  Plus,
  LayoutDashboard,
  Eye,
  Bell,
  Stethoscope,
  ChevronLeft,
  FolderOpen,
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import Logo from '../../../assets/logos/logo-emprehmet.svg'
import styles from './Sidebar.module.css'

const NAV_ITEMS = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    to: '/visualizacao',
    label: 'Visualização',
    icon: Eye,
  },
  {
    to: '/verificar-laudos',
    label: 'Verificar Laudos',
    icon: ClipboardCheck,
  },
  {
    to: '/atribuir-laudo',
    label: 'Atribuir Laudo',
    icon: Plus,
  },
  {
    to: '/condicoes',
    label: 'Condições / Doenças',
    icon: Stethoscope,
  },
  {
    to: '/arquivos',
    label: 'Arquivos',
    icon: FolderOpen,
  },
]

export default function AppSidebar() {
  const { naoLidas } = useNotificacoes()
  const { collapsed, toggle } = useSidebar()

  return (
    <TooltipProvider delayDuration={0}>
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
        <div className={styles.header}>
          {!collapsed && (
            <img 
              src={Logo} 
              alt="Logo" 
              className={styles.logo}
            />
          )}
          
          <button
            onClick={toggle}
            className={styles.toggleButton}
            aria-label={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
          >
            <ChevronLeft className={`${styles.toggleIcon} ${collapsed ? styles.rotated : ''}`} />
          </button>
        </div>

        <nav className={styles.nav}>
          <div className={styles.section}>
            {!collapsed && <span className={styles.sectionLabel}>Navegação</span>}
            <ul className={styles.menu}>
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  {collapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className={styles.menuItemWrapper}>
                          <NavLink
                            to={item.to}
                            className={({ isActive }) =>
                              `${styles.menuItem} ${isActive ? styles.active : ''}`
                            }
                          >
                            <item.icon className={styles.icon} />
                          </NavLink>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{item.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        `${styles.menuItem} ${isActive ? styles.active : ''}`
                      }
                    >
                      <item.icon className={styles.icon} />
                      <span>{item.label}</span>
                    </NavLink>
                  )}
                </li>
              ))}

              <li>
                {collapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className={styles.menuItemWrapper}>
                        <NavLink
                          to="/email-sync"
                          className={({ isActive }) =>
                            `${styles.menuItem} ${isActive ? styles.active : ''}`
                          }
                        >
                          <div className={styles.iconWrapper}>
                            <Bell className={styles.icon} />
                            {naoLidas > 0 && (
                              <span className={styles.badge}>
                                {naoLidas > 9 ? '9+' : naoLidas}
                              </span>
                            )}
                          </div>
                        </NavLink>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Notificações PJe</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <NavLink
                    to="/email-sync"
                    className={({ isActive }) =>
                      `${styles.menuItem} ${isActive ? styles.active : ''}`
                    }
                  >
                    <div className={styles.iconWrapper}>
                      <Bell className={styles.icon} />
                      {naoLidas > 0 && (
                        <span className={styles.badge}>
                          {naoLidas > 9 ? '9+' : naoLidas}
                        </span>
                      )}
                    </div>
                    <span>Notificações PJe</span>
                  </NavLink>
                )}
              </li>
            </ul>
          </div>
        </nav>

        <div className={styles.footer}>
          {!collapsed && (
            <div className={styles.footerContent}>
              <span className={styles.footerText}>Sistema de Laudos v1.0</span>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}
