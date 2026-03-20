import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotificacoes } from '../../contexts/NotificacoesContext'
import { useAuth } from '../../contexts/AuthContext'
import { useLaudos } from '../../contexts/LaudoContext'
import { toast } from 'sonner'
import Modal from '../../components/ui/Modal/Modal'
import Button from '../../components/ui/Button/Button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { TypographyH1, TypographyMuted, TypographyH3, TypographyP, TypographySmall, TypographyLead } from '@/components/ui/typography'
import { InputField } from '@/components/ui/Input'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  Settings,
  Mail,
  Copy,
  Check,
  Trash2,
  Link,
  Plus,
  AlertTriangle,
  Forward,
  Filter,
  ChevronDown,
  RefreshCw,
  ChevronRight,
  ExternalLink,
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

const TIPO_META = {
  nova_pericia: { label: 'Nova Perícia', color: 'bg-blue-100 text-blue-700', borderColor: 'border-l-blue-500' },
  intimacao: { label: 'Intimação', color: 'bg-yellow-100 text-yellow-700', borderColor: 'border-l-yellow-500' },
  prazo: { label: 'Prazo', color: 'bg-red-100 text-red-700', borderColor: 'border-l-red-500' },
  laudo_devolvido: { label: 'Laudo Devolvido', color: 'bg-orange-100 text-orange-700', borderColor: 'border-l-orange-500' },
  outro: { label: 'Outro', color: 'bg-gray-100 text-gray-700', borderColor: 'border-l-gray-500' },
}

function formatDate(iso) {
  const d = new Date(iso)
  const now = new Date()
  const diff = now - d
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)} min atrás`
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 3600000)}h atrás`
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatPrazo(iso) {
  if (!iso) return null
  const d = new Date(iso)
  const diff = d - new Date()
  const days = Math.ceil(diff / (24 * 60 * 60 * 1000))
  if (days < 0) return { text: 'Prazo vencido', critical: true }
  if (days === 0) return { text: 'Vence hoje', critical: true }
  if (days === 1) return { text: 'Vence amanhã', critical: true }
  if (days <= 5) return { text: `Vence em ${days} dias`, critical: true }
  return { text: `Vence em ${days} dias`, critical: false }
}

function NotificationCard({ notification, onExpand, isExpanded, onMarcarLida, onExcluir, onVincular, onCriarLaudo }) {
  const tipo = TIPO_META[notification.tipo] || TIPO_META.outro
  const prazoInfo = formatPrazo(notification.prazo)

  const handleExpand = (e) => {
    e.stopPropagation()
    onExpand(notification.id)
  }

  return (
    <div
      className={`bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all border-l-4 ${tipo.borderColor} ${notification.lida ? 'bg-muted/30' : ''}`}
    >
      <div
        className="flex items-start justify-between gap-3 cursor-pointer"
        onClick={handleExpand}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {!notification.lida && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${notification.lida ? 'bg-gray-200 text-gray-500' : tipo.color}`}>{tipo.label}</span>
              {notification.urgente && !notification.lida && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">Urgente</span>
              )}
              {prazoInfo && !notification.lida && (
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${prazoInfo.critical ? 'bg-red-100 text-red-700' : 'bg-muted text-muted-foreground'}`}>
                  {prazoInfo.text}
                </span>
              )}
            </div>
            <p className={`text-sm font-medium mb-1 ${notification.lida ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
              {notification.assunto || 'Notificação sem assunto'}
            </p>
            <div className={`flex items-center gap-4 text-xs ${notification.lida ? 'text-gray-400' : 'text-muted-foreground'}`}>
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {notification.origemEmail || 'Sistema'}
              </span>
              <span>{formatDate(notification.dataRecebimento)}</span>
              {notification.processo && (
                <span className="font-mono">Processo: {notification.processo}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
          <Checkbox
            checked={notification.lida}
            onCheckedChange={(checked) => onMarcarLida(notification.id, checked === true)}
            className="cursor-pointer"
          />
          <Button variant="ghost" size="sm" onClick={() => onExcluir(notification.id)} className="text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
          <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t">
          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">De:</p>
                  <p className="text-sm font-medium">{notification.origemEmail || 'Sistema'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Recebido em:</p>
                  <p className="text-sm">{new Date(notification.dataRecebimento).toLocaleString('pt-BR')}</p>
                </div>
                {notification.processo && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Processo:</p>
                    <p className="text-sm font-mono font-medium">{notification.processo}</p>
                  </div>
                )}
                {notification.tribunal && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Tribunal:</p>
                    <p className="text-sm">{notification.tribunal}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="border-t pt-3">
              <p className="text-xs text-muted-foreground mb-2">Conteúdo do e-mail:</p>
              <p className="text-sm text-foreground whitespace-pre-wrap">{notification.resumo || 'Sem conteúdo disponível.'}</p>
            </div>
            {notification.link && (
              <div className="border-t pt-3 flex items-center gap-2">
                <a href={notification.link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                  <ExternalLink className="w-4 h-4" />
                  Abrir no PJe
                </a>
              </div>
            )}
            <div className="border-t pt-3 flex gap-2 flex-wrap">
              {notification.processo && !notification.laudoVinculado && (
                <Button variant="default" size="sm" onClick={() => onCriarLaudo(notification.processo)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Laudo
                </Button>
              )}
              {notification.processo && !notification.laudoVinculado && (
                <Button variant="outline" size="sm" onClick={() => onVincular(notification.id)}>
                  <Link className="w-4 h-4 mr-2" />
                  Vincular Laudo
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function EmailInstructions({ emailRecebimento }) {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-muted rounded-lg space-y-3 text-sm">
        <p className="font-medium text-foreground">Configure uma regra de encaminhamento no seu cliente de e-mail:</p>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex-shrink-0">1</span>
            <p>Abra as configurações de <strong>filtros/regras</strong> do seu cliente de e-mail (Gmail, Outlook, etc.)</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex-shrink-0">2</span>
            <p>Crie uma nova regra com a condição: <strong>Remetente contém "@pje.jus.br"</strong></p>
          </div>
          <div className="flex items-start gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex-shrink-0">3</span>
            <p>Adicione a ação: <strong>Encaminhar para</strong> <code className="px-1.5 py-0.5 bg-muted rounded text-xs">{emailRecebimento}</code></p>
          </div>
        </div>
      </div>
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
        <AlertTriangle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-blue-800">
          <strong>Dica:</strong> Certifique-se de que o remetente do PJe está preenchido corretamente na aba anterior.
          Você também pode adicionar outros remetentes (tribunais) manualmente.
        </p>
      </div>
    </div>
  )
}

const FORM_EMPTY = { tipo: 'nova_pericia', assunto: '', corpo: '', processo: '', prazo: '', urgente: false }

export default function EmailSyncPage() {
  const { notificacoes, marcarLida, excluirNotificacao, vincularLaudo, simularRecebimento, config } = useNotificacoes()
  const { user } = useAuth()
  const { laudos } = useLaudos()
  const navigate = useNavigate()

  const [aba, setAba] = useState('notificacoes')
  const [expandida, setExpandida] = useState(null)
  const [modalSimular, setModalSimular] = useState(false)
  const [formSimular, setFormSimular] = useState(FORM_EMPTY)
  const [modalVincular, setModalVincular] = useState(null)
  const [vincularLaudoId, setVincularLaudoId] = useState('')
  const [emailLocal, setEmailLocal] = useState(config?.emailMedico || '')
  const [savedMsg, setSavedMsg] = useState('')
  const [searchProcesso, setSearchProcesso] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [filtroLida, setFiltroLida] = useState(false)
  const [copied, setCopied] = useState(false)
  const [deleteNotificacaoId, setDeleteNotificacaoId] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const emailRecebimento = `pje-${user?.id || 'user'}@emprehmet.com`

  const filtered = (notificacoes || []).filter(n => {
    const matchProc = !searchProcesso || (n.processo && n.processo.includes(searchProcesso))
    const matchTipo = filtroTipo === 'todos' || n.tipo === filtroTipo
    const matchLida = !filtroLida || !n.lida
    return matchProc && matchTipo && matchLida
  })

  function handleCopyEmail() {
    navigator.clipboard.writeText(emailRecebimento)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleSaveConfig() {
    if (!emailLocal) return
    useNotificacoes.setState(s => ({
      config: { ...s.config, emailMedico: emailLocal, ativo: true }
    }))
    setSavedMsg('Config salvo!')
    setTimeout(() => setSavedMsg(''), 3000)
  }

  function handleMarcarLida(id, lida) {
    marcarLida(id, lida)
  }

  function handleExcluirNotificacao(id) {
    excluirNotificacao(id)
    setExpandida(null)
    setDeleteNotificacaoId(null)
  }

  async function handleRefresh() {
    setRefreshing(true)
    await new Promise(r => setTimeout(r, 1500))
    setRefreshing(false)
    toast.success('E-mails sincronizados com sucesso!')
  }

  function handleSimular() {
    if (!formSimular.assunto.trim()) {
      alert('Preencha o assunto')
      return
    }
    simularRecebimento({
      tipo: formSimular.tipo,
      assunto: formSimular.assunto,
      resumo: formSimular.corpo || 'Corpo simulação...',
      processo: formSimular.processo || '0000000-00.2025.0.00.0000',
      prazo: formSimular.prazo || null,
      urgente: formSimular.urgente,
    })
    setModalSimular(false)
    setFormSimular(FORM_EMPTY)
  }

  function handleVincular() {
    if (!vincularLaudoId) return
    vincularLaudo(modalVincular, vincularLaudoId)
    setModalVincular(null)
    setVincularLaudoId('')
  }

  const TIPO_OPTIONS = [
    { value: 'todos', label: 'Todos os tipos' },
    ...Object.entries(TIPO_META).map(([k, v]) => ({ value: k, label: v.label })),
  ]

  const selectedTipoLabel = TIPO_OPTIONS.find(opt => opt.value === filtroTipo)?.label || 'Todos os tipos'

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <TypographyH1 className="text-2xl lg:text-3xl mb-1 flex items-center gap-2">
            <Forward className="w-7 h-7" />
            Sincronização de E-mail
          </TypographyH1>
          <TypographyMuted>
            {(notificacoes || []).length} notificação(ões), {(notificacoes || []).filter(n => !n.lida).length} não lida(s)
          </TypographyMuted>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Sincronizando...' : 'Atualizar'}
          </Button>
          <Button variant="default" onClick={() => setModalSimular(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Simular
          </Button>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        {['notificacoes', 'configuracao'].map(tab => (
          <button
            key={tab}
            onClick={() => setAba(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${aba === tab ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {tab === 'notificacoes' ? 'Notificações' : 'Configuração'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {aba === 'notificacoes' && (
          <motion.div
            key="notificacoes"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="flex flex-col sm:flex-row gap-3 p-4 bg-card border border-border rounded-lg">
              <InputField
                className="flex-1"
                type="text"
                placeholder="Buscar por nº do processo..."
                value={searchProcesso}
                onChange={e => setSearchProcesso(e.target.value)}
              />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-4 py-2 border border-input rounded-md text-sm bg-background hover:bg-muted/50 transition-colors min-w-[180px]">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <span className="flex-1 text-left">{selectedTipoLabel}</span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[180px]">
                  {TIPO_OPTIONS.map(opt => (
                    <DropdownMenuItem
                      key={opt.value}
                      onClick={() => setFiltroTipo(opt.value)}
                      className="cursor-pointer"
                    >
                      {opt.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <Checkbox
                  checked={filtroLida}
                  onCheckedChange={(checked) => setFiltroLida(checked === true)}
                />
                Somente não lidas
              </label>
            </div>

            {filtered.length === 0 ? (
              <Card className="py-16">
                <CardContent className="flex flex-col items-center justify-center text-center">
                  <div className="p-4 bg-muted rounded-full mb-4">
                    <Mail className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <TypographyH3 className="mb-2">Nenhuma notificação encontrada</TypographyH3>
                  <TypographyMuted className="max-w-md">
                    Configure o encaminhamento de e-mail na aba Configuração para começar a receber alertas do PJe aqui.
                  </TypographyMuted>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filtered.map(n => (
                  <NotificationCard
                    key={n.id}
                    notification={n}
                    onExpand={(id) => setExpandida(expandida === id ? null : id)}
                    isExpanded={expandida === n.id}
                    onMarcarLida={handleMarcarLida}
                    onExcluir={(id) => setDeleteNotificacaoId(id)}
                    onVincular={setModalVincular}
                    onCriarLaudo={(processo) => navigate(`/atribuir-laudo?processo=${encodeURIComponent(processo)}`)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {aba === 'configuracao' && (
          <motion.div
            key="configuracao"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">1</span>
                  Endereço de recebimento do sistema
                </CardTitle>
                <CardDescription>
                  Este é o e-mail gerado para o seu perfil. Você vai redirecionar os e-mails do PJe para este endereço.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg border">
                  <code className="flex-1 font-mono text-sm text-primary font-semibold break-all">{emailRecebimento}</code>
                  <Button variant="outline" size="sm" onClick={handleCopyEmail}>
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-1.5 text-green-600" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1.5" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
                <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-yellow-800">
                    <strong>Atenção:</strong> Este endereço é exclusivo para receber notificações do PJe.
                    Para que a integração funcione em produção, é necessário configurar um serviço de e-mail inbound.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">2</span>
                  Seu e-mail cadastrado no PJe
                </CardTitle>
                <CardDescription>
                  Informe o e-mail que você usa no PJe para receber as notificações de novas perícias.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <InputField
                    className="flex-1"
                    type="email"
                    placeholder="seu.email@gmail.com"
                    value={emailLocal}
                    onChange={e => setEmailLocal(e.target.value)}
                  />
                  <Button variant="default" onClick={handleSaveConfig} disabled={!emailLocal}>
                    Salvar
                  </Button>
                  {savedMsg && (
                    <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      {savedMsg}
                    </span>
                  )}
                </div>
                {config.ativo && (
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <span className="w-2 h-2 rounded-full bg-green-600" />
                    Encaminhamento ativo para: <strong>{config.emailMedico}</strong>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">3</span>
                  Configure o encaminhamento automático
                </CardTitle>
                <CardDescription>
                  Os e-mails do PJe precisam ser redirecionados automaticamente para o endereço gerado.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EmailInstructions emailRecebimento={emailRecebimento} />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal
        isOpen={modalSimular}
        onClose={() => { setModalSimular(false); setFormSimular(FORM_EMPTY) }}
        title="Simular recebimento de notificação PJe"
        size="md"
      >
        <p className="text-sm text-muted-foreground mb-4">
          Útil para testar o fluxo sem depender de um e-mail real do tribunal.
        </p>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField
              id="tipo"
              label="Tipo"
              list="tipo-list"
              value={formSimular.tipo}
              onChange={e => setFormSimular(f => ({ ...f, tipo: e.target.value }))}
            />
            <datalist id="tipo-list">
              {Object.entries(TIPO_META).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </datalist>
            <div className="flex items-center">
              <Checkbox
                checked={formSimular.urgente}
                onCheckedChange={(checked) => setFormSimular(f => ({ ...f, urgente: checked === true }))}
              />
              <label className="flex items-center gap-2 text-sm cursor-pointer ml-2">
                <span className="font-medium">Marcar como urgente</span>
              </label>
            </div>
          </div>
          <InputField
            id="assunto"
            label="Assunto"
            placeholder="Ex: Intimação para entrega de laudo"
            value={formSimular.assunto}
            onChange={e => setFormSimular(f => ({ ...f, assunto: e.target.value }))}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Corpo</label>
            <Textarea
              rows={4}
              placeholder="Conteúdo do e-mail..."
              value={formSimular.corpo}
              onChange={e => setFormSimular(f => ({ ...f, corpo: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              id="processo"
              label="Processo"
              placeholder="0000000-00.2025.0.00.0000"
              value={formSimular.processo}
              onChange={e => setFormSimular(f => ({ ...f, processo: e.target.value }))}
            />
            <InputField
              id="prazo"
              label="Prazo"
              type="date"
              value={formSimular.prazo}
              onChange={e => setFormSimular(f => ({ ...f, prazo: e.target.value }))}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="cancel" onClick={() => { setModalSimular(false); setFormSimular(FORM_EMPTY) }}>Cancelar</Button>
          <Button variant="default" onClick={handleSimular}>Simular recebimento</Button>
        </div>
      </Modal>

      <Modal
        isOpen={!!modalVincular}
        onClose={() => { setModalVincular(null); setVincularLaudoId('') }}
        title="Vincular a um laudo existente"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Vincular notificação do processo <strong>{modalVincular}</strong> a um laudo existente:
          </p>
          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-2 px-4 py-2.5 border border-input rounded-lg text-sm bg-white hover:bg-gray-50 transition-colors">
                  <span className="flex-1 text-left">
                    {vincularLaudoId
                      ? laudos.find(l => l.id === vincularLaudoId)?.numero + ' - ' + (laudos.find(l => l.id === vincularLaudoId)?.paciente?.nome || 'Sem paciente')
                      : 'Selecione um laudo...'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                sideOffset={4}
                className="max-h-60 overflow-y-auto"
                style={{ minWidth: 'var(--radix-dropdown-menu-trigger-width)', zIndex: 1050 }}
              >
                {laudos.length === 0 ? (
                  <DropdownMenuItem disabled className="text-muted-foreground">
                    Nenhum laudo disponível
                  </DropdownMenuItem>
                ) : (
                  laudos.map(l => (
                    <DropdownMenuItem
                      key={l.id}
                      onClick={() => setVincularLaudoId(l.id)}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{l.numero}</span>
                        <span className="text-xs text-muted-foreground">{l.paciente?.nome || 'Sem paciente'}</span>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="cancel" onClick={() => { setModalVincular(null); setVincularLaudoId('') }}>Cancelar</Button>
          <Button variant="default" onClick={handleVincular} disabled={!vincularLaudoId}>Vincular</Button>
        </div>
      </Modal>

      <AlertDialog open={!!deleteNotificacaoId} onOpenChange={(open) => !open && setDeleteNotificacaoId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta notificação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleExcluirNotificacao(deleteNotificacaoId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
