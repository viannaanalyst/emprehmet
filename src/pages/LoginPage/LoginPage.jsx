import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { TypographyH1, TypographyMuted } from '@/components/ui/typography'
import { InputFieldWithSuffix } from '@/components/ui/Input'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import styles from './LoginPage.module.css'
import Logo from '../../assets/logos/logo-emprehmet.svg'

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    if (!username || !password) {
      toast.error('Preencha todos os campos.')
      return
    }
    setLoading(true)
    const ok = await login(username, password)
    setLoading(false)
    if (ok) {
      toast.success('Login realizado com sucesso!')
      navigate('/dashboard', { replace: true })
    } else {
      toast.error('Usuário ou senha incorretos.')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brandSection}>
          <div className={styles.logo}>
            <img src={Logo} alt="Logo Emprehmet" className={styles.logoImage} />
          </div>
          <TypographyH1 className={styles.appName}>Sistema de Laudos</TypographyH1>
          <TypographyMuted className={styles.appDesc}>Gestão e elaboração de laudos periciais</TypographyMuted>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <InputFieldWithSuffix
            id="username"
            label="Usuário"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Digite seu usuário"
            autoComplete="username"
            autoFocus
          />
          
          <InputFieldWithSuffix
            id="password"
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Digite sua senha"
            autoComplete="current-password"
            suffix={
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />

          <div className={styles.rememberRow}>
            <Checkbox
              id="rememberMe"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
            />
            <label htmlFor="rememberMe" className={styles.checkboxLabel}>
              Lembrar-me
            </label>
          </div>

          <button className={styles.submit} type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className={styles.hint}>
          Acesso padrão: usuário <strong>admin</strong> / senha <strong>admin123</strong>
        </p>
      </div>
    </div>
  )
}
