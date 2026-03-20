export const KEYS = {
  USERS: 'sl_users',
  LAUDOS: 'sl_laudos',
  SESSION: 'sl_session',
  DISEASE_LIB: 'sl_disease_lib',
  LAUDO_COUNTER: 'sl_laudo_counter',
  NOTIFICACOES: 'sl_notificacoes',
  EMAIL_CONFIG: 'sl_email_config',
}

export function read(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // localStorage can throw on storage quota exceeded
    console.error(`[storage] Failed to write key "${key}"`)
  }
}

export function remove(key) {
  localStorage.removeItem(key)
}
