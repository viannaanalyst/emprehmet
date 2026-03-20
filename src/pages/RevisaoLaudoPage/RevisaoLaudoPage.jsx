import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLaudos } from '../../contexts/LaudoContext'
import { useAuth } from '../../contexts/AuthContext'
import RichTextEditor, { plainTextToHtml } from '../../components/laudo/RichTextEditor/RichTextEditor'
import { StatusBadge } from '../../components/ui/Badge/Badge'
import Button from '../../components/ui/Button/Button'
import { InputField } from '@/components/ui/Input'
import { TypographyH1, TypographyMuted, TypographyH3, TypographyP } from '@/components/ui/typography'
import { exportToPdf } from '../../utils/exportPdf'
import { exportToDocx } from '../../utils/exportDocx'
import styles from './RevisaoLaudoPage.module.css'

const CRM_KEY = 'sl_medico_crm'

export default function RevisaoLaudoPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getLaudoById, updateLaudo } = useLaudos()
  const { currentUser } = useAuth()

  const laudo = getLaudoById(id)

  // Estado do HTML editado pelo médico
  const [htmlContent, setHtmlContent] = useState(() => {
    if (!laudo) return '<p></p>'
    // Usa textoHtml salvo (edições anteriores) ou converte o plain-text original
    return laudo.textoHtml || plainTextToHtml(laudo.textoLaudo)
  })

  // CRM do perito — persiste no localStorage para conveniência
  const [crm, setCrm] = useState(() => localStorage.getItem(CRM_KEY) || '')
  const [crmSaved, setCrmSaved] = useState(true)

  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(null) // 'pdf' | 'docx' | null
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(() => {
    setCrmSaved(false)
  }, [crm])

  if (!laudo) {
    return (
      <div className={styles.notFound}>
        <p>Laudo não encontrado.</p>
        <Button variant="outline" onClick={() => navigate('/visualizacao')}>
          Voltar para Visualização
        </Button>
      </div>
    )
  }

  function handleCrmBlur() {
    localStorage.setItem(CRM_KEY, crm)
    setCrmSaved(true)
  }

  async function handleSave() {
    setSaving(true)
    updateLaudo(laudo.id, { textoHtml: htmlContent })
    setSaveMsg('Alterações salvas com sucesso!')
    setTimeout(() => setSaveMsg(''), 3000)
    setSaving(false)
  }

  async function handleExportPdf() {
    if (!crm.trim()) {
      alert('Preencha o campo CRM antes de gerar o PDF.')
      return
    }
    setExporting('pdf')
    try {
      await exportToPdf({
        htmlContent,
        medicoNome: currentUser?.nome || laudo.peritoNome || 'Médico Perito',
        crm,
        fileName: `laudo-${laudo.numero}.pdf`,
      })
    } catch (err) {
      console.error('Erro ao gerar PDF:', err)
      alert('Ocorreu um erro ao gerar o PDF. Verifique o console para detalhes.')
    }
    setExporting(null)
  }

  async function handleExportDocx() {
    if (!crm.trim()) {
      alert('Preencha o campo CRM antes de gerar o Word.')
      return
    }
    setExporting('docx')
    try {
      await exportToDocx({
        htmlContent,
        medicoNome: currentUser?.nome || laudo.peritoNome || 'Médico Perito',
        crm,
        fileName: `laudo-${laudo.numero}.docx`,
      })
    } catch (err) {
      console.error('Erro ao gerar DOCX:', err)
      alert('Ocorreu um erro ao gerar o arquivo Word. Verifique o console para detalhes.')
    }
    setExporting(null)
  }

  return (
    <div className={styles.page}>

      {/* ── Cabeçalho ─────────────────────────────────────────────────────── */}
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Voltar
          </button>
          <div>
            <div className={styles.titleRow}>
              <TypographyH1 className={styles.title}>Revisão e Finalização</TypographyH1>
              <StatusBadge status={laudo.status} />
            </div>
            <TypographyMuted className={styles.sub}>
              {laudo.numero} · {laudo.paciente?.nome} · {laudo.paciente?.processo || ''}
            </TypographyMuted>
          </div>
        </div>

        <div className={styles.topActions}>
          {saveMsg && <span className={styles.saveMsg}>{saveMsg}</span>}
          <Button variant="outline" onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar edições'}
          </Button>
          <Button
            variant="secondary"
            onClick={handleExportDocx}
            disabled={!!exporting}
            className={styles.wordBtn}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            {exporting === 'docx' ? 'Gerando...' : 'Baixar Word (.docx)'}
          </Button>
          <Button
            variant="default"
            onClick={handleExportPdf}
            disabled={!!exporting}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {exporting === 'pdf' ? 'Gerando PDF...' : 'Baixar Laudo (PDF PJe)'}
          </Button>
        </div>
      </div>

      <div className={styles.layout}>

        {/* ── Painel lateral — dados + CRM ───────────────────────────────── */}
        <aside className={styles.sidebar}>
          <section className={styles.infoCard}>
            <TypographyH3 className={styles.cardTitle}>Dados do Laudo</TypographyH3>
            <dl className={styles.dl}>
              <dt>Número</dt><dd>{laudo.numero}</dd>
              <dt>Paciente</dt><dd>{laudo.paciente?.nome}</dd>
              {laudo.paciente?.cpf && <><dt>CPF</dt><dd>{laudo.paciente.cpf}</dd></>}
              {laudo.paciente?.dataNascimento && (
                <><dt>Nascimento</dt><dd>{new Date(laudo.paciente.dataNascimento + 'T12:00').toLocaleDateString('pt-BR')}</dd></>
              )}
              {laudo.paciente?.processo && <><dt>Processo</dt><dd>{laudo.paciente.processo}</dd></>}
              <dt>Perito</dt><dd>{laudo.peritoNome}</dd>
              <dt>Data</dt><dd>{new Date(laudo.criadoEm).toLocaleDateString('pt-BR')}</dd>
            </dl>
          </section>

          {laudo.doencasSelecionadas?.length > 0 && (
            <section className={styles.infoCard}>
              <TypographyH3 className={styles.cardTitle}>Condições ({laudo.doencasSelecionadas.length})</TypographyH3>
              <ul className={styles.condList}>
                {laudo.doencasSelecionadas.map(d => (
                  <li key={d.id || d.diseaseId}>
                    <span className={styles.cid}>{d.codigo}</span>
                    <span>{d.nome}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className={styles.infoCard}>
            <TypographyH3 className={styles.cardTitle}>Assinatura Eletrônica</TypographyH3>
            <TypographyP className={styles.crmHint}>
              Nome e CRM são inseridos automaticamente no rodapé do PDF e do Word.
            </TypographyP>
            <InputField
              id="perito-nome"
              label="Nome do Perito"
              value={currentUser?.nome || ''}
              readOnly
              title="Nome do usuário logado"
            />
            <div className="flex flex-col gap-1.5">
              <InputField
                id="crm"
                label="CRM *"
                value={crm}
                onChange={e => setCrm(e.target.value)}
                onBlur={handleCrmBlur}
                placeholder="Ex: CRM/SP 123456"
              />
              {crmSaved && crm && (
                <span className={styles.crmSaved}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Salvo
                </span>
              )}
            </div>
            <div className={styles.signaturePreview}>
              <p>___________________________________________________</p>
              <p><strong>Dr(a). {currentUser?.nome || '[Nome]'}</strong></p>
              <p>Médico(a) Perito(a) - CRM {crm || '[CRM]'}</p>
              <p><em>Documento preparado para assinatura digital via token (e-CPF/PJeOffice). A validação criptográfica ocorrerá no ato do envio ao portal do tribunal.</em></p>
            </div>
          </section>
        </aside>

        {/* ── Editor principal ────────────────────────────────────────────── */}
        <div className={styles.editorWrap}>
          <div className={styles.editorHeader}>
            <span className={styles.editorLabel}>Texto do Laudo (editável)</span>
            <span className={styles.editorHint}>Negrito, itálico, listas e alinhamento disponíveis na barra acima</span>
          </div>
          <RichTextEditor
            content={htmlContent}
            onChange={setHtmlContent}
          />
        </div>

      </div>
    </div>
  )
}
