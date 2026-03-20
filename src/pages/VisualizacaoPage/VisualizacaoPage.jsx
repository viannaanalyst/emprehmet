import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLaudos } from '../../contexts/LaudoContext'
import LaudoCard from '../../components/laudo/LaudoCard/LaudoCard'
import Modal from '../../components/ui/Modal/Modal'
import LaudoPreview from '../../components/laudo/LaudoPreview/LaudoPreview'
import Button from '../../components/ui/Button/Button'
import { TypographyH1, TypographyMuted, TypographyH3 } from '@/components/ui/typography'
import { InputField } from '@/components/ui/Input'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronDown, Filter } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'rascunho', label: 'Rascunho' },
  { value: 'em_analise', label: 'Em Análise' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'arquivado', label: 'Arquivado' },
]

export default function VisualizacaoPage() {
  const { laudos } = useLaudos()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedLaudo, setSelectedLaudo] = useState(null)

  const filtered = laudos.filter(l => {
    const matchSearch =
      !search ||
      l.paciente?.nome?.toLowerCase().includes(search.toLowerCase()) ||
      l.numero?.toLowerCase().includes(search.toLowerCase()) ||
      l.paciente?.processo?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || l.status === statusFilter
    return matchSearch && matchStatus
  })

  const sorted = [...filtered].sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm))
  const selectedLabel = STATUS_OPTIONS.find(opt => opt.value === statusFilter)?.label || 'Todos os status'

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row sm:items-start justify-between gap-4"
      >
        <div>
          <TypographyH1 className="text-2xl lg:text-3xl mb-1">
            Visualização de Laudos
          </TypographyH1>
          <TypographyMuted>
            {laudos.length} laudo(s) no total
          </TypographyMuted>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
          <InputField
            type="text"
            placeholder="Buscar por paciente, número ou processo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            inputClassName="pl-10"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2 border border-input rounded-md text-sm bg-background hover:bg-muted/50 transition-colors min-w-[180px]">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="flex-1 text-left">{selectedLabel}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px]">
            {STATUS_OPTIONS.map(opt => (
              <DropdownMenuItem
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className="cursor-pointer"
              >
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      <AnimatePresence mode="wait">
        {sorted.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="py-16">
              <CardContent className="flex flex-col items-center justify-center text-center">
                <div className="p-4 bg-muted rounded-full mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <TypographyH3 className="mb-2">Nenhum laudo encontrado</TypographyH3>
                <TypographyMuted className="max-w-md">
                  Utilize "Atribuir Laudo" para criar o primeiro laudo.
                </TypographyMuted>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {sorted.map(l => (
              <LaudoCard key={l.id} laudo={l} onClick={() => setSelectedLaudo(l)} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <Modal
        isOpen={!!selectedLaudo}
        onClose={() => setSelectedLaudo(null)}
        title={selectedLaudo ? `Laudo ${selectedLaudo.numero}` : ''}
        size="lg"
      >
        <LaudoPreview laudo={selectedLaudo} />
        <div className="flex justify-end mt-4 pt-4 border-t">
          <Button variant="default" onClick={() => navigate(`/revisar-laudo/${selectedLaudo?.id}`)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Revisar e Finalizar (PDF / Word)
          </Button>
        </div>
      </Modal>
    </motion.div>
  )
}
