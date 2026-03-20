import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Calendar, AlertTriangle, Stethoscope, Clock } from 'lucide-react'

const statusConfig = {
  urgente: {
    variant: 'destructive',
    label: 'Urgente',
    icon: AlertTriangle,
    className: 'bg-red-50 border-red-200 hover:bg-red-100',
  },
  nova_pericia: {
    variant: 'info',
    label: 'Nova Perícia',
    icon: Stethoscope,
    className: 'bg-sky-50 border-sky-200 hover:bg-sky-100',
  },
  intimacao: {
    variant: 'warning',
    label: 'Intimação',
    icon: Calendar,
    className: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
  },
  prazo: {
    variant: 'secondary',
    label: 'Prazo',
    icon: Clock,
    className: 'bg-slate-50 border-slate-200 hover:bg-slate-100',
  },
}

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
    },
  },
}

export function NotificationCard({ notification, index = 0 }) {
  const status = statusConfig[notification.tipo] || statusConfig.prazo
  const StatusIcon = status.icon

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      custom={index}
      style={{
        transitionDelay: `${index * 0.05}s`,
      }}
    >
      <Card className={`transition-colors cursor-pointer ${status.className}`}>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-semibold text-foreground truncate">
                  {notification.numeroProcesso}
                </h4>
                <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                  <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{notification.orgao}</span>
                </div>
              </div>
              <Badge variant={status.variant} className="flex-shrink-0">
                <StatusIcon className="w-3 h-3 mr-1" />
                {status.label}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2">
              {notification.descricao}
            </p>

            {notification.prazo && (
              <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  Prazo: {notification.prazo}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function NotificationList({ notifications }) {
  return (
    <div className="grid gap-4">
      {notifications.map((notification, index) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          index={index}
        />
      ))}
    </div>
  )
}
