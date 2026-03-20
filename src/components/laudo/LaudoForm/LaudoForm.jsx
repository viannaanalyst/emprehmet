import { useState } from 'react'
import { Input, Textarea, InputField } from '@/components/ui/Input'
import Button from '../../ui/Button/Button'
import DiseaseLibraryPanel from '../../disease/DiseaseLibraryPanel/DiseaseLibraryPanel'
import SelectedDiseasesList from '../../disease/SelectedDiseasesList/SelectedDiseasesList'
import LaudoPreview from '../LaudoPreview/LaudoPreview'
import { assembleText } from '../../../utils/laudoBuilder'
import styles from './LaudoForm.module.css'

const STEPS = [
  { id: 1, label: 'Dados do Paciente' },
  { id: 2, label: 'Introdução' },
  { id: 3, label: 'Condições' },
  { id: 4, label: 'Conclusão' },
  { id: 5, label: 'Preview' },
]

const INITIAL_FORM = {
  paciente: { nome: '', cpf: '', dataNascimento: '', processo: '' },
  introducao: '',
  doencasSelecionadas: [],
  conclusao: '',
}

function validate(step, form) {
  if (step === 1) {
    if (!form.paciente.nome.trim()) return 'O nome do paciente é obrigatório.'
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(form.paciente.nome)) return 'O nome deve conter apenas letras.'
    if (!form.paciente.cpf.trim()) return 'O CPF é obrigatório.'
    if (form.paciente.cpf.replace(/\D/g, '').length !== 11) return 'O CPF deve ter 11 dígitos.'
    if (!form.paciente.dataNascimento.trim()) return 'A data de nascimento é obrigatória.'
  }
  return null
}

function formatCPF(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

function formatNome(value) {
  return value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')
}

function formatData(value) {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

export default function LaudoForm({ onSubmit }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(INITIAL_FORM)
  const [error, setError] = useState('')

  function setField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function setPacienteField(field, value) {
    setForm(prev => ({ ...prev, paciente: { ...prev.paciente, [field]: value } }))
  }

  function handleAddDisease(disease) {
    if (form.doencasSelecionadas.some(d => d.id === disease.id)) return
    setField('doencasSelecionadas', [...form.doencasSelecionadas, disease])
  }

  function handleRemoveDisease(id) {
    setField('doencasSelecionadas', form.doencasSelecionadas.filter(d => d.id !== id))
  }

  function nextStep() {
    const err = validate(step, form)
    if (err) { setError(err); return }
    setError('')
    setStep(s => s + 1)
  }

  function prevStep() {
    setError('')
    setStep(s => s - 1)
  }

  function handleSubmit(status) {
    onSubmit({ ...form, status })
  }

  const previewLaudo = {
    paciente: form.paciente,
    doencasSelecionadas: form.doencasSelecionadas,
    textoLaudo: assembleText(form.introducao, form.doencasSelecionadas, form.conclusao, form.paciente),
  }

  return (
    <div className={styles.form}>
      {/* Step indicator */}
      <div className={styles.steps}>
        {STEPS.map(s => (
          <div key={s.id} className={`${styles.stepItem} ${step === s.id ? styles.stepActive : ''} ${step > s.id ? styles.stepDone : ''}`}>
            <div className={styles.stepNum}>
              {step > s.id ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : s.id}
            </div>
            <span className={styles.stepLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className={styles.body}>
        {step === 1 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Dados do Paciente</h3>
            <div className={styles.grid2}>
              <InputField
                label="Nome completo *"
                id="nome"
                value={form.paciente.nome}
                onChange={e => setPacienteField('nome', formatNome(e.target.value))}
                placeholder="Nome do paciente"
              />
              <InputField
                label="CPF *"
                id="cpf"
                value={form.paciente.cpf}
                onChange={e => setPacienteField('cpf', formatCPF(e.target.value))}
                placeholder="000.000.000-00"
                inputMode="numeric"
              />
              <InputField
                label="Data de Nascimento *"
                id="dataNascimento"
                value={form.paciente.dataNascimento}
                onChange={e => setPacienteField('dataNascimento', formatData(e.target.value))}
                placeholder="dd/mm/yyyy"
                inputMode="numeric"
                maxLength={10}
              />
              <InputField
                label="Número do Processo"
                id="processo"
                value={form.paciente.processo}
                onChange={e => setPacienteField('processo', e.target.value)}
                placeholder="Nº do processo ou referência"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Texto de Introdução</h3>
            <p className={styles.hint}>Descreva o objetivo da perícia, data, local e demais informações introdutórias.</p>
            <Textarea
              id="introducao"
              rows={10}
              value={form.introducao}
              onChange={e => setField('introducao', e.target.value)}
              placeholder="Aos [data], compareceu para avaliação pericial o(a) periciando(a) ..."
            />
          </div>
        )}

        {step === 3 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Seleção de Condições / Doenças</h3>
            <p className={styles.hint}>Selecione as condições identificadas. As descrições serão inseridas automaticamente no laudo.</p>
            <div className={styles.diseaseGrid}>
              <DiseaseLibraryPanel
                selectedDiseases={form.doencasSelecionadas}
                onAddDisease={handleAddDisease}
              />
              <div className={styles.selectedPanel}>
                <div className={styles.selectedHeader}>
                  <h4>Condições Selecionadas ({form.doencasSelecionadas.length})</h4>
                </div>
                <div className={styles.selectedBody}>
                  <SelectedDiseasesList
                    diseases={form.doencasSelecionadas}
                    onRemove={handleRemoveDisease}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Conclusão</h3>
            <p className={styles.hint}>Redija a conclusão da perícia, incluindo o parecer técnico final.</p>
            <Textarea
              id="conclusao"
              rows={10}
              value={form.conclusao}
              onChange={e => setField('conclusao', e.target.value)}
              placeholder="Diante do exposto, conclui-se que ..."
            />
          </div>
        )}

        {step === 5 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Preview do Laudo</h3>
            <p className={styles.hint}>Revise o laudo completo antes de salvar. As descrições das condições selecionadas foram inseridas automaticamente.</p>
            <LaudoPreview laudo={previewLaudo} />
          </div>
        )}

        {error && <p className={styles.error}>{error}</p>}
      </div>

      {/* Navigation */}
      <div className={styles.nav}>
        <div>
          {step > 1 && (
            <Button variant="outline" onClick={prevStep}>
              ← Anterior
            </Button>
          )}
          {step < 5 && (
            <Button variant="default" onClick={nextStep}>
              Próximo →
            </Button>
          )}
          {step === 5 && (
            <>
              <Button variant="secondary" onClick={() => handleSubmit('rascunho')}>
                Salvar como Rascunho
              </Button>
              <Button variant="default" onClick={() => handleSubmit('em_analise')}>
                Enviar para Análise
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
