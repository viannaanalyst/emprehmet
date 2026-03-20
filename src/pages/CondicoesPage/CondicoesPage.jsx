import { useState } from 'react'
import { useDiseases } from '../../contexts/DiseaseContext'
import Modal from '../../components/ui/Modal/Modal'
import Button from '../../components/ui/Button/Button'
import Input, { Textarea } from '../../components/ui/Input/Input'
import styles from './CondicoesPage.module.css'

const EMPTY_FORM = { nome: '', codigo: '', categoria: '', descricao: '' }

function validate(form) {
  if (!form.nome.trim()) return 'O nome é obrigatório.'
  if (!form.codigo.trim()) return 'O código CID é obrigatório.'
  if (!form.categoria.trim()) return 'A categoria é obrigatória.'
  if (!form.descricao.trim()) return 'A descrição é obrigatória.'
  return null
}

export default function CondicoesPage() {
  const { diseases, categories, addDisease, updateDisease, deleteDisease } = useDiseases()

  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('Todas')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingDisease, setEditingDisease] = useState(null) // null = new, object = editing
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

  // Unique categories from all diseases (including new ones added)
  const allCategories = ['Todas', ...new Set(diseases.map(d => d.categoria))]

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

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Condições / Doenças</h1>
          <p className={styles.sub}>{diseases.length} condição(ões) cadastrada(s)</p>
        </div>
        <Button variant="primary" onClick={openNew}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nova Condição
        </Button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <input
          className={styles.search}
          type="text"
          placeholder="Buscar por nome, código CID ou categoria..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className={styles.select}
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
        >
          {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--grey-300)', marginBottom: 10 }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <p>Nenhuma condição encontrada.</p>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Código CID</th>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Descrição</th>
                <th style={{ width: 110 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id}>
                  <td><span className={styles.code}>{d.codigo}</span></td>
                  <td className={styles.nameCell}>{d.nome}</td>
                  <td><span className={styles.category}>{d.categoria}</span></td>
                  <td className={styles.descCell}>{d.descricao.slice(0, 100)}{d.descricao.length > 100 ? '...' : ''}</td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.editBtn} onClick={() => openEdit(d)} title="Editar">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Editar
                      </button>
                      <button className={styles.deleteBtn} onClick={() => setDeleteTarget(d)} title="Excluir">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6"/><path d="M14 11v6"/>
                          <path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingDisease ? `Editar: ${editingDisease.nome}` : 'Nova Condição / Doença'}
        size="lg"
      >
        <div className={styles.formGrid}>
          <Input
            label="Nome da condição *"
            id="d-nome"
            value={form.nome}
            onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
            placeholder="Ex: Transtorno Depressivo Recorrente"
          />
          <div className={styles.row2}>
            <Input
              label="Código CID *"
              id="d-codigo"
              value={form.codigo}
              onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))}
              placeholder="Ex: F33"
            />
            <div className={styles.catField}>
              <label className={styles.label} htmlFor="d-categoria">Categoria *</label>
              <input
                id="d-categoria"
                className={styles.input}
                list="cat-list"
                value={form.categoria}
                onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
                placeholder="Ex: Transtornos Mentais"
              />
              <datalist id="cat-list">
                {allCategories.filter(c => c !== 'Todas').map(c => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>
          <Textarea
            label="Descrição para o laudo *"
            id="d-descricao"
            rows={8}
            value={form.descricao}
            onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
            placeholder="Texto que será inserido automaticamente no laudo quando esta condição for selecionada. Use {{nome_paciente}} para incluir o nome do paciente automaticamente."
          />
          <p className={styles.tokenHint}>
            Tokens disponíveis: <code>{'{{nome_paciente}}'}</code> e <code>{'{{codigo}}'}</code> — serão substituídos automaticamente ao gerar o laudo.
          </p>
        </div>

        {formError && <p className={styles.formError}>{formError}</p>}

        <div className={styles.modalFooter}>
          <Button variant="outline" onClick={closeModal}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave}>
            {editingDisease ? 'Salvar Alterações' : 'Adicionar Condição'}
          </Button>
        </div>
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Excluir Condição"
        size="sm"
      >
        <p style={{ fontSize: '0.9rem', color: 'var(--grey-700)', lineHeight: 1.6, marginBottom: 20 }}>
          Deseja excluir a condição <strong>{deleteTarget?.nome}</strong>?
          Esta ação não pode ser desfeita. Laudos já criados com esta condição não serão afetados.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete}>Excluir</Button>
        </div>
      </Modal>
    </div>
  )
}
