import { useNavigate } from 'react-router-dom'
import { useLaudos } from '../../contexts/LaudoContext'
import { useAuth } from '../../contexts/AuthContext'
import { useSidebar } from '../../contexts/SidebarContext'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { TypographyH1, TypographyMuted, TypographyH2, TypographyH3, TypographySmall, TypographyP } from '@/components/ui/typography'
import {
  FileText,
  Edit,
  Clock,
  Check,
  LayoutDashboard,
  Eye,
  ClipboardCheck,
  Plus,
} from 'lucide-react'

function StatCard({ label, value, colorClass, icon: Icon, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className={`overflow-hidden border-l-4 ${colorClass}`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${colorClass === 'border-l-blue-500' ? 'bg-blue-500/10' : colorClass === 'border-l-gray-500' ? 'bg-gray-500/10' : colorClass === 'border-l-yellow-500' ? 'bg-yellow-500/10' : 'bg-green-500/10'}`}>
              <Icon className={`w-6 h-6 ${colorClass === 'border-l-blue-500' ? 'text-blue-600' : colorClass === 'border-l-gray-500' ? 'text-gray-600' : colorClass === 'border-l-yellow-500' ? 'text-yellow-600' : 'text-green-600'}`} />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{value}</p>
              <TypographySmall className="text-muted-foreground">{label}</TypographySmall>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function ActionCard({ icon: Icon, title, description, onClick, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
    >
      <Card
        className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1 group"
        onClick={onClick}
      >
        <CardContent className="p-6 flex flex-col items-center text-center gap-3">
          <div className="p-4 rounded-2xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
            <Icon className="w-7 h-7 text-primary" />
          </div>
          <div>
            <TypographyH3 className="mb-1">{title}</TypographyH3>
            <TypographyP className="text-muted-foreground leading-relaxed">{description}</TypographyP>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function DashboardPage() {
  const { laudos } = useLaudos()
  const { currentUser } = useAuth()
  const { collapsed } = useSidebar()
  const navigate = useNavigate()

  const total = laudos.length
  const rascunhos = laudos.filter(l => l.status === 'rascunho').length
  const emAnalise = laudos.filter(l => l.status === 'em_analise').length
  const concluidos = laudos.filter(l => l.status === 'concluido').length
  const arquivados = laudos.filter(l => l.status === 'arquivado').length

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 mb-2 sm:mb-0">
          <LayoutDashboard className="w-7 h-7 text-primary" />
          <TypographyH1 className="text-2xl lg:text-3xl">
            Dashboard
          </TypographyH1>
        </div>
        <TypographyMuted className="mb-4 sm:mb-0">
          Bem-vindo(a), <span className="font-semibold text-foreground">{currentUser?.nome}</span>
        </TypographyMuted>
        <motion.button
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/atribuir-laudo')}
        >
          <Plus className="w-4 h-4" />
          Novo Laudo
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total de Laudos"
          value={total}
          colorClass="border-l-blue-500"
          icon={FileText}
          index={0}
        />
        <StatCard
          label="Rascunhos"
          value={rascunhos}
          colorClass="border-l-gray-500"
          icon={Edit}
          index={1}
        />
        <StatCard
          label="Em Análise"
          value={emAnalise}
          colorClass="border-l-yellow-500"
          icon={Clock}
          index={2}
        />
        <StatCard
          label="Concluídos"
          value={concluidos}
          colorClass="border-l-green-500"
          icon={Check}
          index={3}
        />
      </div>

      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-2 mb-4">
          <TypographyH2>Acesso Rápido</TypographyH2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ActionCard
            icon={Eye}
            title="Visualizar Laudos"
            description="Consulte todos os laudos cadastrados no sistema"
            onClick={() => navigate('/visualizacao')}
            index={0}
          />
          <ActionCard
            icon={ClipboardCheck}
            title="Verificar Laudos"
            description="Gerencie o status e andamento dos laudos"
            onClick={() => navigate('/verificar-laudos')}
            index={1}
          />
          <ActionCard
            icon={Plus}
            title="Novo Laudo"
            description="Crie um novo laudo pericial"
            onClick={() => navigate('/atribuir-laudo')}
            index={2}
          />
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-6">
            <TypographyH3 className="mb-3">Resumo</TypographyH3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-foreground">{total}</p>
                <TypographySmall className="text-muted-foreground">Total</TypographySmall>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-gray-600">{rascunhos}</p>
                <TypographySmall className="text-muted-foreground">Rascunhos</TypographySmall>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{emAnalise}</p>
                <TypographySmall className="text-muted-foreground">Em Análise</TypographySmall>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{concluidos}</p>
                <TypographySmall className="text-muted-foreground">Concluídos</TypographySmall>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
