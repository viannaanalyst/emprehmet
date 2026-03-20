import { useState, useRef, useEffect } from 'react'
import {
  FileText,
  Image as ImageIcon,
  FolderOpen,
  ClipboardList,
  MoreVertical,
  Eye,
  Download,
  Trash2,
  Upload,
  Search,
  ChevronRight,
  Home,
  X,
  File,
  FileCheck,
  Loader2,
  Plus,
  User,
  FileSpreadsheet,
  CheckCircle2,
  Star,
  CheckSquare,
  Square,
  FolderPlus,
  Folder,
  ArrowLeft,
  Move,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/Button/Button'
import { InputField } from '@/components/ui/Input'
import Modal from '@/components/ui/Modal/Modal'
import { Progress } from '@/components/ui/Progress'
import { usePastas } from '@/contexts/PastasContext'

const FILTROS = [
  { id: 'todos', label: 'Todos', icon: FolderOpen },
  { id: 'favoritos', label: 'Favoritos', icon: Star },
  { id: 'pdf', label: 'PDFs', icon: FileText },
  { id: 'imagem', label: 'Imagens', icon: ImageIcon },
  { id: 'docx', label: 'Documentos', icon: FileSpreadsheet },
]

const getIconPorTipo = (tipo) => {
  switch (tipo) {
    case 'pdf':
      return { cor: 'text-red-500', bg: 'bg-red-50' }
    case 'docx':
      return { cor: 'text-blue-600', bg: 'bg-blue-50' }
    case 'imagem':
      return { cor: 'text-green-600', bg: 'bg-green-50' }
    default:
      return { cor: 'text-gray-500', bg: 'bg-gray-50' }
  }
}

const getTipoFromMime = (mimeType) => {
  if (mimeType.includes('pdf')) return 'pdf'
  if (mimeType.includes('image')) return 'imagem'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'docx'
  return 'docx'
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function FileExplorer() {
  const {
    clientes,
    clienteAtivo,
    selecionarCliente,
    criarPasta,
    criarSubpasta,
    excluirPasta,
    excluirSubpasta,
    adicionarArquivo,
    excluirArquivo,
    atualizarArquivo,
    moverArquivos,
    favoritarArquivos,
  } = usePastas()

  const [novaPastaMode, setNovaPastaMode] = useState(false)
  const [nomeNovaPasta, setNomeNovaPasta] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchClientes, setSearchClientes] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [isDragOver, setIsDragOver] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(null)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [editingFileId, setEditingFileId] = useState(null)
  const [editingFileName, setEditingFileName] = useState('')
  const [selectedItems, setSelectedItems] = useState(new Set())
  const [subpastaAtual, setSubpastaAtual] = useState(null)
  const [novaSubpastaMode, setNovaSubpastaMode] = useState(false)
  const [nomeNovaSubpasta, setNomeNovaSubpasta] = useState('')
  const [corNovaSubpasta, setCorNovaSubpasta] = useState('#EAB308')
  const [moveModalOpen, setMoveModalOpen] = useState(false)
  const [dragOverSubpastaId, setDragOverSubpastaId] = useState(null)
  const [isDraggingFile, setIsDraggingFile] = useState(false)
  const [draggingFileId, setDraggingFileId] = useState(null)
  const [isDraggingOverHome, setIsDraggingOverHome] = useState(false)

  const CORES_PASTA = [
    { value: '#EAB308', label: 'Amarelo' },
    { value: '#3B82F6', label: 'Azul' },
    { value: '#10B981', label: 'Verde' },
    { value: '#EF4444', label: 'Vermelho' },
    { value: '#8B5CF6', label: 'Roxo' },
    { value: '#F97316', label: 'Laranja' },
    { value: '#EC4899', label: 'Rosa' },
    { value: '#6B7280', label: 'Cinza' },
  ]
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (uploadComplete) {
      const timer = setTimeout(() => {
        setUploadComplete(false)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [uploadComplete])

  const clientesFiltrados = searchClientes
    ? clientes.filter((c) => c.nome.toLowerCase().includes(searchClientes.toLowerCase()))
    : clientes

  const arquivosFiltrados = clienteAtivo
    ? clienteAtivo.arquivos.filter((arq) => {
        const matchBusca = arq.nome.toLowerCase().includes(searchTerm.toLowerCase())
        const matchTipo = filtroTipo === 'todos' || arq.tipo === filtroTipo
        const matchFavorito = filtroTipo !== 'favoritos' || arq.favorito
        return matchBusca && matchTipo && matchFavorito
      })
    : []

  const handleCriarPasta = () => {
    if (nomeNovaPasta.trim()) {
      criarPasta(nomeNovaPasta.trim())
      setNomeNovaPasta('')
      setNovaPastaMode(false)
    }
  }

  const handleExcluirPasta = (cliente) => {
    if (confirm(`Deseja excluir a pasta "${cliente.nome}" e todos seus arquivos?`)) {
      excluirPasta(cliente.id)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    if (clienteAtivo) {
      if (e.dataTransfer.types.includes('Files')) {
        setIsDragOver(true)
      }
    }
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const processFile = (file) => {
    const tipo = getTipoFromMime(file.type)
    let url = '/mock/uploaded-file'
    
    if (tipo === 'imagem') {
      url = URL.createObjectURL(file)
    }
    
    const novoArquivo = {
      nome: file.name,
      tipo,
      tamanho: formatFileSize(file.size),
      dataUpload: new Date().toISOString().split('T')[0],
      url,
      file,
      favorito: false,
    }
    
    return novoArquivo
  }

  const handleUploadWithProgress = (files) => {
    if (!clienteAtivo || files.length === 0) return

    const file = files[0]
    setUploadProgress(0)

    const novoArquivo = processFile(file)

    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        
        adicionarArquivo(clienteAtivo.id, novoArquivo)
        setUploadProgress(100)
        
        setTimeout(() => {
          setUploadProgress(null)
          setUploadComplete(true)
        }, 300)
      } else {
        setUploadProgress(Math.min(progress, 95))
      }
    }, 150)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)

    if (isDraggingFile) return

    const files = e.dataTransfer.files
    if (files.length > 0 && clienteAtivo) {
      handleUploadWithProgress(files)
    }
  }

  const handleFileDragStart = (e, arquivo) => {
    setIsDraggingFile(true)
    setDraggingFileId(arquivo.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleFileDragEnd = () => {
    setIsDraggingFile(false)
    setDraggingFileId(null)
    setDragOverSubpastaId(null)
  }

  const handleSubpastaDragOver = (e, subpasta) => {
    e.preventDefault()
    if (isDraggingFile) {
      e.dataTransfer.dropEffect = 'move'
      setDragOverSubpastaId(subpasta.id)
    }
  }

  const handleSubpastaDragLeave = () => {
    setDragOverSubpastaId(null)
  }

  const handleSubpastaDrop = (e, subpasta) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverSubpastaId(null)
    setIsDraggingFile(false)
    setDraggingFileId(null)

    let filesToMove = []

    if (selectedItems.size > 0) {
      filesToMove = Array.from(selectedItems)
        .filter(k => k.startsWith('f-'))
        .map(k => k.replace('f-', ''))
    } else if (draggingFileId) {
      filesToMove = [draggingFileId]
    }

    if (filesToMove.length > 0) {
      moverArquivos(clienteAtivo.id, filesToMove, subpasta.id, subpastaAtual?.id || null)
      if (subpastaAtual) {
        setSubpastaAtual(prev => ({
          ...prev,
          arquivos: prev.arquivos.filter(a => !filesToMove.includes(a.id))
        }))
      }
      toast.success(`${filesToMove.length} arquivo(s) movido(s) para "${subpasta.nome}"!`)
      setSelectedItems(new Set())
    }
  }

  const handleHomeDragOver = (e) => {
    e.preventDefault()
    if (isDraggingFile) {
      setIsDraggingOverHome(true)
    }
  }

  const handleHomeDragLeave = () => {
    setIsDraggingOverHome(false)
  }

  const handleHomeDrop = (e) => {
    e.preventDefault()
    setIsDraggingOverHome(false)
    setIsDraggingFile(false)
    setDraggingFileId(null)

    let filesToMove = []

    if (selectedItems.size > 0) {
      filesToMove = Array.from(selectedItems)
        .filter(k => k.startsWith('f-'))
        .map(k => k.replace('f-', ''))
    } else if (draggingFileId) {
      filesToMove = [draggingFileId]
    }

    if (filesToMove.length > 0) {
      moverArquivos(clienteAtivo.id, filesToMove, 'root', subpastaAtual?.id || null)
      if (subpastaAtual) {
        setSubpastaAtual(prev => ({
          ...prev,
          arquivos: prev.arquivos.filter(a => !filesToMove.includes(a.id))
        }))
      }
      toast.success(`${filesToMove.length} arquivo(s) movido(s) para a pasta principal!`)
      setSelectedItems(new Set())
    }
  }

  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const files = e.target.files
    if (files && files.length > 0 && clienteAtivo) {
      handleUploadWithProgress(files)
    }
    e.target.value = ''
  }

  const handleVisualizar = (arquivo) => {
    if (arquivo.tipo === 'imagem') {
      setPreviewImage(arquivo)
    } else {
      window.open(arquivo.url, '_blank')
    }
  }

  const handleDownload = (arquivo) => {
    if (arquivo.file) {
      const link = document.createElement('a')
      link.href = URL.createObjectURL(arquivo.file)
      link.download = arquivo.nome
      link.click()
      URL.revokeObjectURL(link.href)
    } else {
      const link = document.createElement('a')
      link.href = arquivo.url
      link.download = arquivo.nome
      link.click()
    }
  }

  const handleExcluirArquivo = (arquivo) => {
    if (confirm(`Deseja excluir o arquivo "${arquivo.nome}"?`)) {
      excluirArquivo(clienteAtivo.id, arquivo.id)
    }
  }

  const handleToggleFavorite = (arquivo, e) => {
    e?.stopPropagation()
    if (clienteAtivo) {
      atualizarArquivo(clienteAtivo.id, arquivo.id, { favorito: !arquivo.favorito })
    }
  }

  const handleStartRename = (arquivo, e) => {
    e?.stopPropagation()
    setEditingFileId(arquivo.id)
    setEditingFileName(arquivo.nome)
  }

  const handleSaveRename = (arquivo) => {
    if (editingFileName.trim() && editingFileName !== arquivo.nome) {
      atualizarArquivo(clienteAtivo.id, arquivo.id, { nome: editingFileName.trim() })
    }
    setEditingFileId(null)
    setEditingFileName('')
  }

  const handleCancelRename = () => {
    setEditingFileId(null)
    setEditingFileName('')
  }

  const handleToggleSelect = (itemId, isFile = true) => {
    setSelectedItems(prev => {
      const key = isFile ? `f-${itemId}` : `s-${itemId}`
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (subpastaAtual) {
      const allIds = subpastaAtual.arquivos.map(a => `f-${a.id}`)
      setSelectedItems(new Set(allIds))
    } else if (clienteAtivo) {
      const fileIds = clienteAtivo.arquivos.map(a => `f-${a.id}`)
      const subpastaIds = (clienteAtivo.subpastas || []).map(s => `s-${s.id}`)
      setSelectedItems(new Set([...fileIds, ...subpastaIds]))
    }
  }

  const handleClearSelection = () => {
    setSelectedItems(new Set())
  }

  const handleDeleteSelected = () => {
    const itemsArray = Array.from(selectedItems)
    const fileIds = itemsArray.filter(k => k.startsWith('f-')).map(k => k.replace('f-', ''))
    const subpastaIds = itemsArray.filter(k => k.startsWith('s-')).map(k => k.replace('s-', ''))
    
    if (fileIds.length > 0) {
      fileIds.forEach(id => excluirArquivo(clienteAtivo.id, id, subpastaAtual?.id))
      toast.success(`${fileIds.length} arquivo(s) excluído(s) com sucesso!`)
    }
    if (subpastaIds.length > 0) {
      if (confirm(`Deseja excluir ${subpastaIds.length} subpasta(s) e todos seus arquivos?`)) {
        subpastaIds.forEach(id => excluirSubpasta(clienteAtivo.id, id))
        toast.success(`${subpastaIds.length} subpasta(s) excluída(s) com sucesso!`)
      }
    }
    setSelectedItems(new Set())
  }

  const handleFavoritarSelected = () => {
    const itemsArray = Array.from(selectedItems)
    const fileIds = itemsArray.filter(k => k.startsWith('f-')).map(k => k.replace('f-', ''))
    if (fileIds.length > 0) {
      favoritarArquivos(clienteAtivo.id, fileIds, true)
      toast.success(`${fileIds.length} arquivo(s) adicionado(s) aos favoritos!`)
    }
    setSelectedItems(new Set())
  }

  const handleCriarSubpasta = () => {
    if (nomeNovaSubpasta.trim()) {
      criarSubpasta(clienteAtivo.id, nomeNovaSubpasta.trim(), corNovaSubpasta)
      toast.success(`Subpasta "${nomeNovaSubpasta.trim()}" criada com sucesso!`)
      setNomeNovaSubpasta('')
      setCorNovaSubpasta('#EAB308')
      setNovaSubpastaMode(false)
    }
  }

  const handleOpenSubpasta = (subpasta) => {
    setSubpastaAtual(subpasta)
    setSelectedItems(new Set())
    setSearchTerm('')
    setFiltroTipo('todos')
  }

  const handleBackToRoot = () => {
    setSubpastaAtual(null)
    setSelectedItems(new Set())
  }

  const handleMoverSelecionados = () => {
    if (selectedItems.size === 0) return
    setMoveModalOpen(true)
  }

  const handleConfirmMove = (destinoSubpastaId) => {
    const itemsArray = Array.from(selectedItems)
    const fileIds = itemsArray.filter(k => k.startsWith('f-')).map(k => k.replace('f-', ''))
    if (fileIds.length > 0) {
      moverArquivos(clienteAtivo.id, fileIds, destinoSubpastaId, subpastaAtual?.id || null)
      toast.success(`${fileIds.length} arquivo(s) movido(s) com sucesso!`)
    }
    setMoveModalOpen(false)
    setSelectedItems(new Set())
  }

  const getCurrentItems = () => {
    if (!clienteAtivo) return { arquivos: [], subpastas: [] }
    if (subpastaAtual) {
      return { arquivos: subpastaAtual.arquivos, subpastas: [] }
    }
    return {
      arquivos: clienteAtivo.arquivos,
      subpastas: clienteAtivo.subpastas || [],
    }
  }

  const getFilteredItems = () => {
    const { arquivos, subpastas } = getCurrentItems()
    const filteredArqs = arquivos.filter((arq) => {
      const matchBusca = arq.nome.toLowerCase().includes(searchTerm.toLowerCase())
      const matchTipo = filtroTipo === 'todos' || arq.tipo === filtroTipo
      const matchFavorito = filtroTipo !== 'favoritos' || arq.favorito
      return matchBusca && matchTipo && matchFavorito
    })
    const filteredSubpastas = subpastas.filter(s =>
      s.nome.toLowerCase().includes(searchTerm.toLowerCase())
    )
    return { arquivos: filteredArqs, subpastas: filteredSubpastas }
  }

  const renderFileIcon = (arquivo) => {
    const { cor, bg } = getIconPorTipo(arquivo.tipo)

    if (arquivo.tipo === 'imagem') {
      return (
        <div className={`w-12 h-12 rounded-lg ${bg} flex items-center justify-center overflow-hidden`}>
          <img
            src={arquivo.url}
            alt={arquivo.nome}
            className="w-full h-full object-cover"
          />
        </div>
      )
    }

    if (arquivo.tipo === 'pdf') {
      return (
        <div className={`w-12 h-12 rounded-lg ${bg} flex items-center justify-center`}>
          <FileText className={`w-6 h-6 ${cor}`} />
        </div>
      )
    }

    if (arquivo.tipo === 'docx') {
      return (
        <div className={`w-12 h-12 rounded-lg ${bg} flex items-center justify-center`}>
          <FileCheck className={`w-6 h-6 ${cor}`} />
        </div>
      )
    }

    return (
      <div className={`w-12 h-12 rounded-lg ${bg} flex items-center justify-center`}>
        <File className={`w-6 h-6 ${cor}`} />
      </div>
    )
  }

  return (
    <>
      <AnimatePresence>
        {isDragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-blue-600/90 backdrop-blur-sm flex items-center justify-center"
            onDragOver={e => e.preventDefault()}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6"
              >
                <Upload className="w-16 h-16 text-white" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-3xl font-bold text-white mb-2"
              >
                Solte para enviar
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-white/90"
              >
                para a pasta de{' '}
                <span className="font-semibold text-white">
                  {clienteAtivo?.nome}
                </span>
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-1 min-h-0 bg-gray-50">
        <aside className="w-72 bg-white border-r border-border flex flex-col">
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Clientes
            </h2>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setNovaPastaMode(true)}
              title="Nova Pasta"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <InputField
              type="text"
              placeholder="Buscar clientes..."
              value={searchClientes}
              onChange={(e) => setSearchClientes(e.target.value)}
              inputClassName="pl-8 h-8 text-xs"
              className="w-full"
            />
          </div>
        </div>

        {novaPastaMode && (
          <div className="p-3 border-b border-border bg-muted/30">
            <div className="flex gap-2">
              <InputField
                type="text"
                placeholder="Nome do cliente..."
                value={nomeNovaPasta}
                onChange={(e) => setNomeNovaPasta(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCriarPasta()}
                autoFocus
                className="flex-1"
              />
              <Button size="sm" onClick={handleCriarPasta}>
                Criar
              </Button>
            </div>
            <button
              onClick={() => {
                setNovaPastaMode(false)
                setNomeNovaPasta('')
              }}
              className="text-xs text-muted-foreground mt-2 hover:text-foreground"
            >
              Cancelar
            </button>
          </div>
        )}

        <nav className="flex-1 overflow-auto p-2">
          {clientesFiltrados.length === 0 ? (
            <div className="text-center py-8 px-4">
              <User className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {searchClientes
                  ? 'Nenhum cliente encontrado.'
                  : 'Nenhum cliente ainda.'}
                <br />
                {!searchClientes && 'Clique em + para adicionar.'}
              </p>
            </div>
          ) : (
            clientesFiltrados.map((cliente) => {
              const isActive = clienteAtivo?.id === cliente.id
              return (
                <div key={cliente.id} className="relative group">
                  <button
                    onClick={() => selecionarCliente(cliente)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <User className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">
                      {cliente.nome} ({cliente.arquivos.length})
                    </span>
                  </button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={`absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center transition-opacity ${
                          isActive
                            ? 'opacity-0 group-hover:opacity-100 bg-primary-foreground/20 hover:bg-primary-foreground/30'
                            : 'opacity-0 group-hover:opacity-100 bg-muted hover:bg-muted/80'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleExcluirPasta(cliente)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir Pasta
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            })
          )}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-border px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <button
                onClick={handleBackToRoot}
                className={`flex items-center gap-2 transition-all rounded px-2 py-1 ${
                  isDraggingOverHome
                    ? 'bg-green-100 text-green-700 scale-110'
                    : 'hover:text-foreground hover:bg-muted'
                }`}
                onDragOver={handleHomeDragOver}
                onDragLeave={handleHomeDragLeave}
                onDrop={handleHomeDrop}
                title="Arraste arquivos aqui para mover para a pasta principal"
              >
                <Home className={`w-4 h-4 ${isDraggingOverHome ? 'text-green-600' : ''}`} />
                {isDraggingOverHome && <span className="text-xs font-medium text-green-700">Solte aqui</span>}
              </button>
              <ChevronRight className="w-4 h-4" />
              <button
                onClick={() => setSubpastaAtual(null)}
                className="hover:text-foreground font-medium"
              >
                {clienteAtivo?.nome}
              </button>
              {subpastaAtual && (
                <>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-foreground font-medium">
                    {subpastaAtual.nome}
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {selectedItems.size > 0 && (
                <button
                  onClick={handleClearSelection}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Limpar seleção ({selectedItems.size})
                </button>
              )}
              <button
                onClick={handleSelectAll}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted"
                title="Selecionar todos"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                Selecionar Todos
              </button>
            </div>
          </div>

          <AnimatePresence>
            {uploadProgress !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3 mb-2">
                  {uploadProgress === 100 ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  )}
                  <span className="text-sm font-medium">
                    {uploadProgress === 100
                      ? 'Upload concluído!'
                      : 'Enviando arquivo...'}
                  </span>
                </div>
                <Progress value={uploadProgress} />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {uploadComplete && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm text-green-700 font-medium">
                  Arquivo adicionado com sucesso!
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {clienteAtivo && (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {FILTROS.map((filtro) => {
                    const Icon = filtro.icon
                    const currentItems = getCurrentItems()
                    let count
                    if (filtro.id === 'todos') {
                      count = currentItems.arquivos.length
                    } else if (filtro.id === 'favoritos') {
                      count = currentItems.arquivos.filter(a => a.favorito).length
                    } else {
                      count = currentItems.arquivos.filter(a => a.tipo === filtro.id).length
                    }
                    
                    return (
                      <button
                        key={filtro.id}
                        onClick={() => setFiltroTipo(filtro.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          filtroTipo === filtro.id
                            ? filtro.id === 'favoritos'
                              ? 'bg-yellow-400 text-yellow-900'
                              : 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${filtro.id === 'favoritos' && count > 0 ? 'fill-current' : ''}`} />
                        {filtro.label}
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                          filtroTipo === filtro.id 
                            ? filtro.id === 'favoritos'
                              ? 'bg-yellow-600 text-white'
                              : 'bg-primary-foreground/20' 
                            : 'bg-background'
                        }`}>
                          {count}
                        </span>
                      </button>
                    )
                  })}
                </div>
                {!subpastaAtual && (
                  <Button variant="outline" size="sm" onClick={() => setNovaSubpastaMode(true)}>
                    <FolderPlus className="w-4 h-4 mr-2" />
                    Nova Subpasta
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                  <InputField
                    type="text"
                    placeholder="Buscar arquivos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    inputClassName="pl-10"
                    className="w-full"
                  />
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                />
                <Button variant="outline" onClick={handleFileClick}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
              </div>
            </>
          )}
        </header>

        <div
          className={`flex-1 overflow-auto p-6 transition-all ${
            isDragOver ? 'bg-blue-50' : ''
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {!clienteAtivo ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <FolderOpen className="w-20 h-20 text-muted-foreground/20 mb-4" />
              <h3 className="text-xl font-medium text-muted-foreground mb-2">
                Selecione ou crie uma pasta de cliente
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Clique no botão + acima da lista para adicionar um novo cliente.
              </p>
              <Button onClick={() => setNovaPastaMode(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Pasta
              </Button>
            </div>
          ) : (() => {
            const { arquivos: filteredFiles, subpastas: filteredSubpastas } = getFilteredItems()
            const hasAnyItems = filteredFiles.length > 0 || filteredSubpastas.length > 0
            
            if (!hasAnyItems) {
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center"
                >
                  <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                    <FileText className="w-12 h-12 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-xl font-medium text-foreground mb-2">
                    Nenhum item encontrado
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2 max-w-md">
                    {(() => {
                      const current = getCurrentItems()
                      const hasFiles = current.arquivos.length > 0
                      const hasSubpastas = current.subpastas.length > 0
                      if (!hasFiles && !hasSubpastas) {
                        return 'Este cliente ainda não possui arquivos ou subpastas.'
                      }
                      return `Nenhum item corresponde ao filtro.`
                    })()}
                  </p>
                  <p className="text-sm text-muted-foreground/70 mb-6">
                    {subpastaAtual ? 'Arraste arquivos aqui.' : 'Crie uma subpasta ou faça upload de arquivos.'}
                  </p>
                  <Button variant="outline" onClick={handleFileClick}>
                    <Upload className="w-4 h-4 mr-2" />
                    Fazer Upload
                  </Button>
                </motion.div>
              )
            }
            
            return (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredSubpastas.map((subpasta, index) => {
                    const isSelected = selectedItems.has(`s-${subpasta.id}`)
                    const isDragOver = dragOverSubpastaId === subpasta.id
                    return (
                      <motion.div
                        key={subpasta.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.03 }}
                        className={`group bg-white rounded-xl border p-4 hover:shadow-lg transition-all cursor-pointer relative ${
                          isDragOver
                            ? 'border-green-500 ring-2 ring-green-500/30 bg-green-50 scale-105 shadow-lg'
                            : isSelected
                              ? 'border-primary ring-2 ring-primary/30 bg-primary/5'
                              : 'border-border hover:border-primary/30'
                        }`}
                        onDoubleClick={() => handleOpenSubpasta(subpasta)}
                        onClick={(e) => {
                          if (!isDraggingFile) {
                            e.stopPropagation()
                            handleToggleSelect(subpasta.id, false)
                          }
                        }}
                        onDragOver={(e) => handleSubpastaDragOver(e, subpasta)}
                        onDragLeave={handleSubpastaDragLeave}
                        onDrop={(e) => handleSubpastaDrop(e, subpasta)}
                      >
                        <div className="absolute top-2 left-2">
                          <button
                            className={`w-6 h-6 rounded flex items-center justify-center transition-all ${
                              isSelected
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted/80 text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-muted'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleSelect(subpasta.id, false)
                            }}
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <div className="flex flex-col items-center text-center">
                          <div className="mb-3 relative">
                            <div
                              className="w-12 h-12 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: (subpasta.cor || '#EAB308') + '20' }}
                            >
                              <Folder className="w-8 h-8" style={{ color: subpasta.cor || '#EAB308' }} />
                            </div>
                            <span
                              className="absolute -bottom-1 -right-1 text-[10px] font-medium px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: (subpasta.cor || '#EAB308') + '30', color: subpasta.cor || '#EAB308' }}
                            >
                              pasta
                            </span>
                          </div>
                          <p className="text-sm font-medium truncate w-full max-w-full mb-1">
                            {subpasta.nome}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {subpasta.arquivos?.length || 0} arquivo(s)
                          </p>
                        </div>
                        {isDragOver ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-green-100/80 rounded-xl">
                            <div className="text-center">
                              <Folder className="w-8 h-8 text-green-600 mx-auto mb-1" />
                              <p className="text-xs font-medium text-green-700">Solte aqui</p>
                            </div>
                          </div>
                        ) : (
                          <p className="absolute bottom-2 right-2 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100">
                            Arraste arquivos para mover
                          </p>
                        )}
                      </motion.div>
                    )
                  })}
                  {filteredFiles.map((arquivo, index) => {
                    const isSelected = selectedItems.has(`f-${arquivo.id}`)
                    return (
                      <motion.div
                        key={arquivo.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: (filteredSubpastas.length + index) * 0.03 }}
                        className={`group bg-white rounded-xl border p-4 hover:shadow-lg transition-all cursor-pointer relative ${
                          arquivo.favorito
                            ? 'border-yellow-400 shadow-yellow-200/50 shadow-md'
                            : isSelected
                              ? 'border-primary ring-2 ring-primary/30 bg-primary/5'
                              : 'border-border hover:border-primary/30'
                        }`}
                        onClick={() => handleVisualizar(arquivo)}
                        draggable
                        onDragStart={(e) => handleFileDragStart(e, arquivo)}
                        onDragEnd={handleFileDragEnd}
                      >
                        <div className="absolute top-2 left-2 z-10">
                          <button
                            className={`w-6 h-6 rounded flex items-center justify-center transition-all ${
                              isSelected
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted/80 text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-muted'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleSelect(arquivo.id, true)
                            }}
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <div className="flex flex-col items-center text-center">
                          <div className="mb-3 relative">
                            {renderFileIcon(arquivo)}
                            <span className="absolute -bottom-1 -right-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted">
                              .{arquivo.tipo === 'imagem' ? 'jpg' : arquivo.tipo}
                            </span>
                          </div>
                          {editingFileId === arquivo.id ? (
                            <input
                              type="text"
                              value={editingFileName}
                              onChange={(e) => setEditingFileName(e.target.value)}
                              onBlur={() => handleSaveRename(arquivo)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveRename(arquivo)
                                if (e.key === 'Escape') handleCancelRename()
                              }}
                              onClick={(e) => e.stopPropagation()}
                              autoFocus
                              className="text-sm font-medium w-full px-2 py-1 border border-primary rounded-md text-center focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                          ) : (
                            <p
                              className="text-sm font-medium truncate w-full max-w-full mb-1 hover:text-primary cursor-text"
                              onClick={(e) => handleStartRename(arquivo, e)}
                              title="Clique para renomear"
                            >
                              {arquivo.nome}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {arquivo.tamanho}
                          </p>
                        </div>
                        <button
                          className={`absolute top-2 left-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            arquivo.favorito
                              ? 'bg-yellow-400 text-yellow-900 opacity-100'
                              : 'bg-muted/80 text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-yellow-100 hover:text-yellow-600'
                          }`}
                          onClick={(e) => handleToggleFavorite(arquivo, e)}
                          title={arquivo.favorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                        >
                          <Star className={`w-4 h-4 ${arquivo.favorito ? 'fill-current' : ''}`} />
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-muted/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity hover:bg-muted"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStartRename(arquivo, e) }}>
                              <FileText className="w-4 h-4 mr-2" />
                              Renomear
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleVisualizar(arquivo)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload(arquivo)}>
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleFavorite(arquivo)}
                              className={arquivo.favorito ? 'text-yellow-600 focus:text-yellow-600' : ''}
                            >
                              <Star className={`w-4 h-4 mr-2 ${arquivo.favorito ? 'fill-current' : ''}`} />
                              {arquivo.favorito ? 'Remover favorito' : 'Adicionar favorito'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleExcluirArquivo(arquivo)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )
          })()}
        </div>

        {clienteAtivo && (
          <footer className="bg-white border-t border-border px-6 py-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                  <Folder className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">
                    {(() => {
                      const { arquivos, subpastas } = getFilteredItems()
                      const totalItems = arquivos.length + subpastas.length
                      return `${totalItems} item(ns)`
                    })()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {subpastaAtual ? subpastaAtual.nome : clienteAtivo.nome}
                  </span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {(() => {
                  const { arquivos } = getFilteredItems()
                  return `${arquivos.reduce((acc, arq) => {
                    const size = arq.tamanho
                    if (size.includes('MB')) return acc + parseFloat(size)
                    return acc + parseFloat(size) / 1024
                  }, 0).toFixed(2)} MB`
                })()}
              </div>
            </div>
          </footer>
        )}

        <AnimatePresence>
          {selectedItems.size > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-border rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] px-5 py-3.5 flex items-center gap-3"
            >
              <div className="flex items-center gap-2.5 pr-3 border-r border-border">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CheckSquare className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {selectedItems.size} selecionado{selectedItems.size > 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMoverSelecionados}
                  className="text-foreground hover:bg-muted/80 hover:text-foreground gap-2"
                >
                  <Move className="w-4 h-4" />
                  Mover
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFavoritarSelected}
                  className="text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700 gap-2"
                >
                  <Star className="w-4 h-4" />
                  Favoritar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteSelected}
                  className="text-destructive hover:bg-red-50 hover:text-red-600 gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </Button>
              </div>
              
              <button
                onClick={handleClearSelection}
                className="ml-1 w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <Modal
          isOpen={novaSubpastaMode}
          onClose={() => {
            setNovaSubpastaMode(false)
            setNomeNovaSubpasta('')
            setCorNovaSubpasta('#EAB308')
          }}
          title="Nova Subpasta"
          size="sm"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: corNovaSubpasta + '20' }}
              >
                <Folder className="w-5 h-5" style={{ color: corNovaSubpasta }} />
              </div>
              <InputField
                type="text"
                placeholder="Nome da subpasta..."
                value={nomeNovaSubpasta}
                onChange={(e) => setNomeNovaSubpasta(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCriarSubpasta()}
                autoFocus
                className="flex-1"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Escolha uma cor:</p>
              <div className="flex flex-wrap gap-2">
                {CORES_PASTA.map((cor) => (
                  <button
                    key={cor.value}
                    type="button"
                    onClick={() => setCorNovaSubpasta(cor.value)}
                    className={`w-8 h-8 rounded-full transition-all flex items-center justify-center ${
                      corNovaSubpasta === cor.value
                        ? 'ring-2 ring-offset-2 ring-primary scale-110'
                        : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: cor.value }}
                    title={cor.label}
                  >
                    {corNovaSubpasta === cor.value && (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setNovaSubpastaMode(false)
                  setNomeNovaSubpasta('')
                  setCorNovaSubpasta('#EAB308')
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleCriarSubpasta}>
                Criar
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={moveModalOpen}
          onClose={() => setMoveModalOpen(false)}
          title="Mover para..."
          size="sm"
        >
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Selecione a subpasta de destino para os arquivos selecionados:
            </p>
            <button
              onClick={() => handleConfirmMove('root')}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors text-left"
            >
              <Home className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium">Pasta raiz ({clienteAtivo?.nome})</span>
            </button>
            {(clienteAtivo?.subpastas || []).map((subpasta) => (
              <button
                key={subpasta.id}
                onClick={() => handleConfirmMove(subpasta.id)}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors text-left"
              >
                <Folder className="w-5 h-5" style={{ color: subpasta.cor || '#EAB308' }} />
                <span className="text-sm font-medium">{subpasta.nome}</span>
              </button>
            ))}
            {(clienteAtivo?.subpastas || []).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma subpasta criada. Os arquivos serão movidos para a pasta raiz.
              </p>
            )}
          </div>
        </Modal>
      </main>

      <Modal
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        title={previewImage?.nome}
        size="xl"
      >
        <div className="flex flex-col items-center">
          {previewImage && (
            <img
              src={previewImage.url}
              alt={previewImage.nome}
              className="max-w-full max-h-[70vh] rounded-lg"
            />
          )}
          <div className="mt-4 flex gap-3">
            <Button variant="outline" onClick={() => setPreviewImage(null)}>
              <X className="w-4 h-4 mr-2" />
              Fechar
            </Button>
            <Button variant="default" onClick={() => handleDownload(previewImage)}>
              <Download className="w-4 h-4 mr-2" />
              Baixar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
    </>
  )
}
