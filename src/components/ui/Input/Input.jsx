import styles from './Input.module.css'

export default function Input({ label, id, error, className = '', ...props }) {
  return (
    <div className={`${styles.field} ${className}`}>
      {label && <label className={styles.label} htmlFor={id}>{label}</label>}
      <input id={id} className={`${styles.input} ${error ? styles.hasError : ''}`} {...props} />
      {error && <span className={styles.error}>{error}</span>}
    </div>
  )
}

export function Textarea({ label, id, error, className = '', rows = 4, ...props }) {
  return (
    <div className={`${styles.field} ${className}`}>
      {label && <label className={styles.label} htmlFor={id}>{label}</label>}
      <textarea id={id} rows={rows} className={`${styles.input} ${styles.textarea} ${error ? styles.hasError : ''}`} {...props} />
      {error && <span className={styles.error}>{error}</span>}
    </div>
  )
}
