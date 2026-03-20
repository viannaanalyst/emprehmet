import { useState, useRef } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { useSidebar } from '../../../contexts/SidebarContext'
import { useNotificacoes } from '../../../contexts/NotificacoesContext'
import { User, LogOut, Settings, HelpCircle, MoreVertical, Edit, Lock, Bell, Check, Camera, X } from 'lucide-react'
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/Avatar'
import { InputField } from '@/components/ui/Input'
import { Checkbox } from '@/components/ui/checkbox'
import Button from '@/components/ui/Button/Button'
import Modal from '@/components/ui/Modal/Modal'
import styles from './Topbar.module.css'

const TABS = [
  { id: 'perfil', label: 'Meu Perfil', icon: User },
  { id: 'seguranca', label: 'Segurança', icon: Lock },
  { id: 'configuracao', label: 'Configuração', icon: Settings },
]

export default function Topbar() {
  const { currentUser, logout, updateUser, updatePassword } = useAuth()
  const { collapsed } = useSidebar()
  const { config, updateConfig } = useNotificacoes()
  
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('perfil')
  
  const [perfilForm, setPerfilForm] = useState({ nome: '', email: '' })
  const [perfilEditMode, setPerfilEditMode] = useState(false)
  const [perfilSaving, setPerfilSaving] = useState(false)
  
  const [senhaForm, setSenhaForm] = useState({ atual: '', nova: '', confirmar: '' })
  const [senhaError, setSenhaError] = useState('')
  const [senhaSuccess, setSenhaSuccess] = useState('')
  const [senhaSaving, setSenhaSaving] = useState(false)
  
  const [notifSettings, setNotifSettings] = useState({
    emailNotif: true,
    browserNotif: false,
    somNotif: true,
  })

  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [cropImage, setCropImage] = useState(null)
  const [crop, setCrop] = useState()
  const [imgRef, setImgRef] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(currentUser?.avatar || null)
  const fileInputRef = useRef(null)

  const getInitials = (name) => {
    if (!name) return 'U'
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  }

  const openProfileModal = () => {
    setPerfilForm({ nome: currentUser?.nome || '', email: currentUser?.email || '' })
    setPerfilEditMode(false)
    setSenhaForm({ atual: '', nova: '', confirmar: '' })
    setSenhaError('')
    setSenhaSuccess('')
    setNotifSettings({
      emailNotif: config?.emailNotif ?? true,
      browserNotif: config?.browserNotif ?? false,
      somNotif: config?.somNotif ?? true,
    })
    setAvatarPreview(currentUser?.avatar || null)
    setActiveTab('perfil')
    setProfileModalOpen(true)
  }

  const handleSavePerfil = async () => {
    setPerfilSaving(true)
    try {
      await updateUser({
        nome: perfilForm.nome,
        email: perfilForm.email,
        avatar: avatarPreview
      })
      setPerfilEditMode(false)
    } catch (error) {
      console.error('Erro ao salvar perfil:', error)
    } finally {
      setPerfilSaving(false)
    }
  }

  const handleCancelPerfil = () => {
    setPerfilForm({ nome: currentUser?.nome || '', email: currentUser?.email || '' })
    setPerfilEditMode(false)
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setCropImage(reader.result)
        setCropModalOpen(true)
      }
      reader.readAsDataURL(file)
    }
    e.target.value = ''
  }

  const handleCropComplete = (crop) => {
    if (imgRef && crop.width && crop.height) {
      const canvas = document.createElement('canvas')
      const scaleX = imgRef.naturalWidth / imgRef.width
      const scaleY = imgRef.naturalHeight / imgRef.height
      canvas.width = crop.width * scaleX
      canvas.height = crop.height * scaleY
      const ctx = canvas.getContext('2d')
      ctx.drawImage(
        imgRef,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      )
      const base64Image = canvas.toDataURL('image/jpeg', 0.9)
      setAvatarPreview(base64Image)
    }
  }

  const handleSaveCrop = () => {
    if (imgRef && crop) {
      handleCropComplete(crop)
    }
    setCropModalOpen(false)
    setCropImage(null)
    setCrop(undefined)
  }

  const handleRemovePhoto = () => {
    setAvatarPreview(null)
  }

  const handleTrocarSenha = async () => {
    setSenhaError('')
    setSenhaSuccess('')
    
    if (!senhaForm.atual.trim()) {
      setSenhaError('Informe a senha atual.')
      return
    }
    if (!senhaForm.nova.trim()) {
      setSenhaError('Informe a nova senha.')
      return
    }
    if (senhaForm.nova.length < 6) {
      setSenhaError('A nova senha deve ter pelo menos 6 caracteres.')
      return
    }
    if (senhaForm.nova !== senhaForm.confirmar) {
      setSenhaError('As senhas não coincidem.')
      return
    }
    
    setSenhaSaving(true)
    try {
      const result = await updatePassword(senhaForm.atual, senhaForm.nova)
      if (result.ok) {
        setSenhaSuccess('Senha alterada com sucesso!')
        setSenhaForm({ atual: '', nova: '', confirmar: '' })
      } else {
        setSenhaError(result.error || 'Erro ao alterar senha.')
      }
    } catch (error) {
      setSenhaError('Erro ao alterar senha.')
    } finally {
      setSenhaSaving(false)
    }
  }

  const handleSaveNotificacoes = async () => {
    await updateConfig({
      emailNotif: notifSettings.emailNotif,
      browserNotif: notifSettings.browserNotif,
      somNotif: notifSettings.somNotif,
    })
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'perfil':
        return (
          <div className="space-y-4">
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4">
                <Avatar size="icon-lg" className="w-24 h-24">
                  <AvatarImage src={avatarPreview || currentUser?.avatar} alt={currentUser?.nome} />
                  <AvatarFallback className="text-2xl">{getInitials(currentUser?.nome)}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 flex gap-1">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors shadow-md"
                    title="Trocar foto"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  {avatarPreview && (
                    <button
                      onClick={handleRemovePhoto}
                      className="w-8 h-8 bg-destructive rounded-full flex items-center justify-center text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-md"
                      title="Remover foto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{currentUser?.username}</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <InputField
              id="profile-nome"
              label="Nome completo"
              value={perfilForm.nome}
              onChange={(e) => setPerfilForm(f => ({ ...f, nome: e.target.value }))}
              disabled={!perfilEditMode}
            />
            <InputField
              id="profile-email"
              label="E-mail"
              type="email"
              value={perfilForm.email}
              onChange={(e) => setPerfilForm(f => ({ ...f, email: e.target.value }))}
              disabled={!perfilEditMode}
            />

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              {perfilEditMode ? (
                <>
                  <Button variant="cancel" onClick={handleCancelPerfil}>
                    Cancelar
                  </Button>
                  <Button 
                    variant="default" 
                    onClick={handleSavePerfil}
                    disabled={perfilSaving || !perfilForm.nome.trim() || !perfilForm.email.trim()}
                  >
                    {perfilSaving ? 'Salvando...' : 'Salvar'}
                  </Button>
                </>
              ) : (
                <Button variant="default" onClick={() => setPerfilEditMode(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Perfil
                </Button>
              )}
            </div>
          </div>
        )

      case 'seguranca':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Altere sua senha para manter sua conta segura.
            </p>

            <InputField
              id="senha-atual"
              label="Senha atual"
              type="password"
              value={senhaForm.atual}
              onChange={(e) => setSenhaForm(f => ({ ...f, atual: e.target.value }))}
              placeholder="••••••••"
            />
            <InputField
              id="senha-nova"
              label="Nova senha"
              type="password"
              value={senhaForm.nova}
              onChange={(e) => setSenhaForm(f => ({ ...f, nova: e.target.value }))}
              placeholder="Mínimo 6 caracteres"
            />
            <InputField
              id="senha-confirmar"
              label="Confirmar nova senha"
              type="password"
              value={senhaForm.confirmar}
              onChange={(e) => setSenhaForm(f => ({ ...f, confirmar: e.target.value }))}
              placeholder="Repita a nova senha"
            />

            {senhaError && (
              <p className="text-sm text-destructive">{senhaError}</p>
            )}
            {senhaSuccess && (
              <p className="text-sm text-green-600 flex items-center gap-2">
                <Check className="w-4 h-4" />
                {senhaSuccess}
              </p>
            )}

            <div className="flex justify-end mt-6 pt-4 border-t">
              <Button 
                variant="default" 
                onClick={handleTrocarSenha}
                disabled={senhaSaving}
              >
                {senhaSaving ? 'Alterando...' : 'Alterar Senha'}
              </Button>
            </div>
          </div>
        )

      case 'configuracao':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Gerencie suas preferências de notificação.
            </p>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Notificações por e-mail</p>
                    <p className="text-xs text-muted-foreground">Receba alertas sobre novos prazos e intimações</p>
                  </div>
                </div>
                <Checkbox
                  checked={notifSettings.emailNotif}
                  onCheckedChange={(checked) => setNotifSettings(s => ({ ...s, emailNotif: checked === true }))}
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Notificações do navegador</p>
                    <p className="text-xs text-muted-foreground">Receba alertas mesmo quando estiver fora do sistema</p>
                  </div>
                </div>
                <Checkbox
                  checked={notifSettings.browserNotif}
                  onCheckedChange={(checked) => setNotifSettings(s => ({ ...s, browserNotif: checked === true }))}
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Som de notificação</p>
                    <p className="text-xs text-muted-foreground">Reproduzir som ao receber novas notificações</p>
                  </div>
                </div>
                <Checkbox
                  checked={notifSettings.somNotif}
                  onCheckedChange={(checked) => setNotifSettings(s => ({ ...s, somNotif: checked === true }))}
                />
              </label>
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t">
              <Button variant="default" onClick={handleSaveNotificacoes}>
                Salvar Configurações
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <header className={`${styles.topbar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.spacer} />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className={styles.userButton}>
            <Avatar size="default" className={styles.avatar}>
              <AvatarImage src={currentUser?.avatar} alt={currentUser?.nome} />
              <AvatarFallback>{getInitials(currentUser?.nome)}</AvatarFallback>
            </Avatar>
            <span className={styles.userName}>{currentUser?.nome}</span>
            <MoreVertical size={16} className={styles.dotsIcon} />
          </button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className={styles.dropdownContent}>
          <DropdownMenuLabel className={styles.dropdownLabel}>
            <div className={styles.dropdownHeader}>
              <Avatar size="lg" className={styles.dropdownAvatar}>
                <AvatarImage src={currentUser?.avatar} alt={currentUser?.nome} />
                <AvatarFallback>{getInitials(currentUser?.nome)}</AvatarFallback>
              </Avatar>
              <div className={styles.dropdownInfo}>
                <span className={styles.dropdownName}>{currentUser?.nome}</span>
                <span className={styles.dropdownRole}>{currentUser?.username}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem className={styles.dropdownItem} onClick={openProfileModal}>
            <User size={18} />
            <span>Meu Perfil</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem className={styles.dropdownItem}>
            <Settings size={18} />
            <span>Configurações</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem className={styles.dropdownItem}>
            <HelpCircle size={18} />
            <span>Ajuda</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            className={`${styles.dropdownItem} ${styles.destructive}`}
            onClick={logout}
          >
            <LogOut size={18} />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Modal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        title="Configurações da Conta"
        size="lg"
      >
        <div className="flex gap-6 h-full">
          <div className="w-40 flex-shrink-0 border-r pr-6">
            <nav className="space-y-1">
              {TABS.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="flex-1 min-w-0 overflow-y-auto max-h-[60vh]">
            {renderTabContent()}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={cropModalOpen}
        onClose={() => {
          setCropModalOpen(false)
          setCropImage(null)
          setCrop(undefined)
        }}
        title="Recortar Foto"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Ajuste a imagem para recortar a área desejada.
          </p>
          <div className="max-h-[400px] overflow-auto flex justify-center bg-black/5 rounded-lg p-2">
            {cropImage && (
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCrop(c)}
                aspect={1}
                circularCrop
              >
                <img
                  ref={setImgRef}
                  src={cropImage}
                  alt="Recortar"
                  className="max-w-full max-h-[350px]"
                  onLoad={(e) => {
                    const img = e.currentTarget
                    setImgRef(img)
                    const size = Math.min(img.width, img.height)
                    setCrop({
                      unit: 'px',
                      x: (img.width - size) / 2,
                      y: (img.height - size) / 2,
                      width: size,
                      height: size,
                    })
                  }}
                />
              </ReactCrop>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="cancel" onClick={() => {
              setCropModalOpen(false)
              setCropImage(null)
              setCrop(undefined)
            }}>
              Cancelar
            </Button>
            <Button variant="default" onClick={handleSaveCrop}>
              Aplicar
            </Button>
          </div>
        </div>
      </Modal>
    </header>
  )
}
