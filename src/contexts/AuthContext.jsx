import { createContext, useContext, useState, useEffect } from 'react'
import { read, write, remove, KEYS } from '../utils/storage'
import { v4 as uuidv4 } from 'uuid'

const AuthContext = createContext(null)

async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

function seedDefaultUser() {
  const users = read(KEYS.USERS) || []
  if (users.length === 0) {
    // Seed a default admin user: login=admin, password=admin123
    hashPassword('admin123').then(hash => {
      write(KEYS.USERS, [{
        id: uuidv4(),
        username: 'admin',
        passwordHash: hash,
        nome: 'Administrador',
        role: 'admin',
      }])
    })
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    seedDefaultUser()
    const session = read(KEYS.SESSION)
    if (session && session.expiresAt > Date.now()) {
      setCurrentUser({ id: session.userId, username: session.username, nome: session.nome, role: session.role })
    } else {
      remove(KEYS.SESSION)
    }
    setLoading(false)
  }, [])

  async function login(username, password) {
    const users = read(KEYS.USERS) || []
    const hash = await hashPassword(password)
    const user = users.find(u => u.username === username && u.passwordHash === hash)
    if (!user) return false

    const session = {
      userId: user.id,
      username: user.username,
      nome: user.nome,
      role: user.role,
      expiresAt: Date.now() + 8 * 60 * 60 * 1000, // 8 hours
    }
    write(KEYS.SESSION, session)
    setCurrentUser({ id: user.id, username: user.username, nome: user.nome, role: user.role })
    return true
  }

  function logout() {
    remove(KEYS.SESSION)
    setCurrentUser(null)
  }

  async function register({ username, nome, password, role = 'perito' }) {
    const users = read(KEYS.USERS) || []
    if (users.find(u => u.username === username)) return { ok: false, error: 'Usuário já existe.' }
    const hash = await hashPassword(password)
    const newUser = { id: uuidv4(), username, passwordHash: hash, nome, role }
    write(KEYS.USERS, [...users, newUser])
    return { ok: true }
  }

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated: !!currentUser, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
