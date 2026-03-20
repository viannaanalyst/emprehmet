import { useState, useMemo } from 'react'
import { useDiseases } from '../../contexts/DiseaseContext'
import Modal from '../../components/ui/Modal/Modal'
import Button from '../../components/ui/Button/Button'
import { InputField, TextareaField } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { TypographyH1, TypographyMuted, TypographyH3, TypographyP, TypographySmall } from '@/components/ui/typography'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Stethoscope,
  Filter,
  ChevronDown,
  Eye,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

const EMPTY_FORM = { nome: '', codigo: '', categoria: '', descricao: '' }

const PAGE_SIZE_OPTIONS = [
  { value: 10, label: '10' },
  { value: 25, label: '25' },
  { value: 50, label: '50' },
  { value: 75, label: '75' },
  { value: 100, label: '100' },
  { value: 'all', label: 'Exibir tudo' },
]

function validate(form) {
  if (!form.nome.trim()) return 'O nome é obrigatório.'
  if (!form.codigo.trim()) return 'O código CID é obrigatório.'
  if (!form.categoria.trim()) return 'A categoria é obrigatória.'
  if (!form.descricao.trim()) return 'A descrição é obrigatória.'
  return null
}

function DiseaseRow({ disease, onEdit, onDelete, index }) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      className="border-b border-border hover:bg-muted/50 transition-colors"
    >
      <td className="px-4 py-3">
        <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-bold font-mono rounded-full">
          {disease.codigo}
        </span>
      </td>
      <td className="px-4 py-3 font-semibold text-foreground">{disease.nome}</td>
      <td className="px-4 py-3">
        <span className="px-2.5 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full">
          {disease.categoria}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">
        {disease.descricao.slice(0, 80)}{disease.descricao.length > 80 ? '...' : ''}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(disease)}
            className="text-primary hover:text-primary hover:bg-primary/10"
          >
            <Edit className="w-4 h-4 mr-1" />
            Editar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(disease)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </motion.tr>
  )
}

export default function CondicoesPage() {
  const { diseases, categories, addDisease, updateDisease, deleteDisease } = useDiseases()

  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('Todas')
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingDisease, setEditingDisease] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filtered = diseases.filter(d => {
    const matchSearch =
      !search ||
      d.nome.toLowerCase().includes(search.toLowerCase()) ||
      d.codigo.toLowerCase().includes(search.toLowerCase()) ||
      d.categoria.toLowerCase().includes(search.toLowerCase())
    const matchCat = catFilter === 'Todas' || d.categoria === catFilter
    return matchSearch && matchCat
  })

  const allCategories = ['Todas', ...new Set(diseases.map(d => d.categoria))]

  const totalPages = pageSize === 'all' ? 1 : Math.ceil(filtered.length / pageSize)

  const paginatedData = useMemo(() => {
    if (pageSize === 'all') return filtered
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return filtered.slice(start, end)
  }, [filtered, currentPage, pageSize])

  const pageSizeLabel = PAGE_SIZE_OPTIONS.find(o => o.value === pageSize)?.label || '10'

  function handlePageSizeChange(value) {
    setPageSize(value)
    setCurrentPage(1)
  }

  function goToPage(page) {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  function openNew() {
    setEditingDisease(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setModalOpen(true)
  }

  function openEdit(disease) {
    setEditingDisease(disease)
    setForm({ nome: disease.nome, codigo: disease.codigo, categoria: disease.categoria, descricao: disease.descricao })
    setFormError('')
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingDisease(null)
    setForm(EMPTY_FORM)
    setFormError('')
  }

  function handleSave() {
    const err = validate(form)
    if (err) { setFormError(err); return }
    if (editingDisease) {
      updateDisease(editingDisease.id, form)
    } else {
      addDisease(form)
    }
    closeModal()
  }

  function handleDelete() {
    deleteDisease(deleteTarget.id)
    setDeleteTarget(null)
  }

  const renderPagination = () => {
    if (pageSize === 'all' || totalPages <= 1) return null

    const pages = []
    const maxVisible = 5
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    let end = Math.min(totalPages, start + maxVisible - 1)

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }

    if (start > 1) {
      pages.push(
        <PaginationItem key={1}>
          <PaginationLink onClick={() => goToPage(1)}>1</PaginationLink>
        </PaginationItem>
      )
      if (start > 2) {
        pages.push(<PaginationEllipsis key="ellipsis-start" />)
      }
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => goToPage(i)}
            isActive={i === currentPage}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      )
    }

    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push(<PaginationEllipsis key="ellipsis-end" />)
      }
      pages.push(
        <PaginationItem key={totalPages}>
          <PaginationLink onClick={() => goToPage(totalPages)}>{totalPages}</PaginationLink>
        </PaginationItem>
      )
    }

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => goToPage(currentPage - 1)}
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
          {pages}
          <PaginationItem>
            <PaginationNext
              onClick={() => goToPage(currentPage + 1)}
              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
  }

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
        <div className="flex items-center gap-2">
          <Stethoscope className="w-7 h-7 text-primary" />
          <TypographyH1 className="text-2xl lg:text-3xl">
            Condições / Doenças
          </TypographyH1>
        </div>
        <TypographyMuted className="mt-1 mb-4 sm:mb-0">
          {filtered.length} condição(ões) encontrada(s) de {diseases.length}
        </TypographyMuted>
        <Button variant="default" onClick={openNew}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Condição
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-3 p-4 bg-card border border-border rounded-lg"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <InputField
            className="pl-10"
            type="text"
            placeholder="Buscar por nome, código CID ou categoria..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2 border border-input rounded-md text-sm bg-background hover:bg-muted/50 transition-colors min-w-[180px]">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="flex-1 text-left">{catFilter}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px]">
            {allCategories.map(c => (
              <DropdownMenuItem
                key={c}
                onClick={() => { setCatFilter(c); setCurrentPage(1) }}
                className="cursor-pointer"
              >
                {c}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2 border border-input rounded-md text-sm bg-background hover:bg-muted/50 transition-colors min-w-[160px]">
              <Eye className="w-4 h-4 text-muted-foreground" />
              <span className="flex-1 text-left">Exibir: {pageSizeLabel}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[160px]">
            {PAGE_SIZE_OPTIONS.map(option => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handlePageSizeChange(option.value)}
                className={`cursor-pointer ${pageSize === option.value ? 'bg-muted font-medium' : ''}`}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="py-16">
              <CardContent className="flex flex-col items-center justify-center text-center">
                <div className="p-4 bg-muted rounded-full mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <TypographyH3 className="mb-2">Nenhuma condição encontrada</TypographyH3>
                <TypographyMuted className="max-w-md">
                  {search || catFilter !== 'Todas'
                    ? 'Tente ajustar os filtros para encontrar o que procura.'
                    : 'Clique em "Nova Condição" para adicionar a primeira.'}
                </TypographyMuted>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="table"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wide">Código CID</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wide">Nome</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wide">Categoria</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wide">Descrição</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wide w-48">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {paginatedData.map((d, index) => (
                        <DiseaseRow
                          key={d.id}
                          disease={d}
                          onEdit={openEdit}
                          onDelete={setDeleteTarget}
                          index={index}
                        />
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </Card>

            {pageSize !== 'all' && filtered.length > pageSize && (
              <div className="flex justify-center mt-6">
                {renderPagination()}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingDisease ? `Editar: ${editingDisease.nome}` : 'Nova Condição / Doença'}
        size="lg"
      >
        <div className="space-y-4">
          <InputField
            id="cond-nome"
            label="Nome da condição *"
            placeholder="Ex: Transtorno Depressivo Recorrente"
            value={form.nome}
            onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
          />

          <div className="grid grid-cols-2 gap-4">
            <InputField
              id="cond-codigo"
              label="Código CID *"
              placeholder="Ex: F33"
              value={form.codigo}
              onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Categoria *</label>
              <input
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                list="cat-list-modal"
                placeholder="Ex: Transtornos Mentais"
                value={form.categoria}
                onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
              />
              <datalist id="cat-list-modal">
                {allCategories.filter(c => c !== 'Todas').map(c => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>

          <TextareaField
            id="cond-descricao"
            label="Descrição *"
            rows={4}
            placeholder="Descreva detalhadamente a condição..."
            value={form.descricao}
            onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
          />

          {formError && (
            <p className="text-sm text-destructive font-medium">{formError}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="cancel" onClick={closeModal}>Cancelar</Button>
          <Button variant="default" onClick={handleSave}>
            {editingDisease ? 'Salvar Alterações' : 'Cadastrar'}
          </Button>
        </div>
      </Modal>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a condição <strong>{deleteTarget?.nome}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
