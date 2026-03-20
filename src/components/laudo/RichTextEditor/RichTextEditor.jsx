import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import styles from './RichTextEditor.module.css'

// ── Ícones inline ────────────────────────────────────────────────────────────

const icons = {
  bold: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>,
  italic: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>,
  underline: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3v7a6 6 0 0 0 12 0V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>,
  h2: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1"/></svg>,
  h3: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2"/><path d="M17 17.5c2 1.5 4 .3 4-1.5a2 2 0 0 0-2-2"/></svg>,
  bullet: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></svg>,
  ordered: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>,
  alignLeft: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/></svg>,
  alignCenter: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="6" x2="3" y2="6"/><line x1="17" y1="12" x2="7" y2="12"/><line x1="19" y1="18" x2="5" y2="18"/></svg>,
  alignRight: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="9" y2="12"/><line x1="21" y1="18" x2="7" y2="18"/></svg>,
  hr: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  undo: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>,
  redo: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>,
}

// ── Botão da toolbar ─────────────────────────────────────────────────────────

function ToolbarBtn({ icon, title, active, disabled, onClick }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={e => { e.preventDefault(); onClick() }}
      className={`${styles.toolBtn} ${active ? styles.toolActive : ''}`}
    >
      {icon}
    </button>
  )
}

// ── Componente principal ─────────────────────────────────────────────────────

export default function RichTextEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
  })

  if (!editor) return null

  const groups = [
    // Formatação inline
    [
      { key: 'bold', title: 'Negrito (Ctrl+B)', active: editor.isActive('bold'), onClick: () => editor.chain().focus().toggleBold().run() },
      { key: 'italic', title: 'Itálico (Ctrl+I)', active: editor.isActive('italic'), onClick: () => editor.chain().focus().toggleItalic().run() },
      { key: 'underline', title: 'Sublinhado (Ctrl+U)', active: editor.isActive('underline'), onClick: () => editor.chain().focus().toggleUnderline().run() },
    ],
    // Títulos
    [
      { key: 'h2', title: 'Título 2', active: editor.isActive('heading', { level: 2 }), onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
      { key: 'h3', title: 'Título 3', active: editor.isActive('heading', { level: 3 }), onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
    ],
    // Listas
    [
      { key: 'bullet', title: 'Lista não ordenada', active: editor.isActive('bulletList'), onClick: () => editor.chain().focus().toggleBulletList().run() },
      { key: 'ordered', title: 'Lista numerada', active: editor.isActive('orderedList'), onClick: () => editor.chain().focus().toggleOrderedList().run() },
    ],
    // Alinhamento
    [
      { key: 'alignLeft', title: 'Alinhar à esquerda', active: editor.isActive({ textAlign: 'left' }), onClick: () => editor.chain().focus().setTextAlign('left').run() },
      { key: 'alignCenter', title: 'Centralizar', active: editor.isActive({ textAlign: 'center' }), onClick: () => editor.chain().focus().setTextAlign('center').run() },
      { key: 'alignRight', title: 'Alinhar à direita', active: editor.isActive({ textAlign: 'right' }), onClick: () => editor.chain().focus().setTextAlign('right').run() },
    ],
    // Extras
    [
      { key: 'hr', title: 'Linha divisória', active: false, onClick: () => editor.chain().focus().setHorizontalRule().run() },
    ],
    // Histórico
    [
      { key: 'undo', title: 'Desfazer (Ctrl+Z)', active: false, disabled: !editor.can().undo(), onClick: () => editor.chain().focus().undo().run() },
      { key: 'redo', title: 'Refazer (Ctrl+Y)', active: false, disabled: !editor.can().redo(), onClick: () => editor.chain().focus().redo().run() },
    ],
  ]

  return (
    <div className={styles.editor}>
      <div className={styles.toolbar}>
        {groups.map((group, gi) => (
          <div key={gi} className={styles.toolGroup}>
            {group.map(item => (
              <ToolbarBtn
                key={item.key}
                icon={icons[item.key]}
                title={item.title}
                active={item.active}
                disabled={item.disabled}
                onClick={item.onClick}
              />
            ))}
          </div>
        ))}
      </div>
      <EditorContent editor={editor} className={styles.content} />
    </div>
  )
}

/**
 * Converte texto plano (formato do laudoBuilder) para HTML compatível com TipTap.
 */
export function plainTextToHtml(text) {
  if (!text) return '<p></p>'
  return text
    .split(/\n?\n?─{10,}\n?\n?/)
    .map(section => {
      const trimmed = section.trim()
      if (!trimmed) return ''
      return '<p>' +
        trimmed
          .replace(/\n\n+/g, '</p><p>')
          .replace(/\n/g, '<br>')
        + '</p>'
    })
    .filter(Boolean)
    .join('<hr>')
}
