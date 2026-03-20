import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotificacoes } from '../../contexts/NotificacoesContext'
import { useAuth } from '../../contexts/AuthContext'
import { useLaudos } from '../../contexts/LaudoContext'
import Modal from '../../components/ui/Modal/Modal'
import Button from '../../components/ui/Button/Button'
import styles from './EmailSyncPage.module.css'

// ── Helpers ──────────────────────────────────────────────────────────────────

const TIPO_META = {
  nova_pericia:    { label: 'Nova Perícia',      color: 'blue',   icon: '🩺' },
  intimacao:       { label: 'Intimação',          color: 'yellow', icon: '⚖️' },
  prazo:           { label: 'Prazo',              color: 'red',    icon: '⏰' },
  laudo_devolvido: { label: 'Laudo Devolvido',   color: 'orange', icon: '↩️' },
  outro:           { label: 'Outro',              color: 'grey',   icon: '📩' },
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

// ── Formulário de simulação ───────────────────────────────────────────────────

const FORM_EMPTY = {
  tipo: 'nova_pericia', processo: '', tribunal: '', assunto: '', resumo: '', prazo: '', urgente: false,
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function EmailSyncPage() {
  const { currentUser } = useAuth()
  const { laudos } = useLaudos()
  const navigate = useNavigate()
  const {
    notificacoes, config, naoLidas,
    marcarLida, marcarTodasLidas, excluirNotificacao,
    vincularLaudo, simularRecebimento, salvarConfig,
  } = useNotificacoes()

  const [aba, setAba] = useState('notificacoes')   // 'notificacoes' | 'configuracao'
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [filtroLida, setFiltroLida] = useState(false)
  const [searchProcesso, setSearchProcesso] = useState('')
  const [expandida, setExpandida] = useState(null)   // id da notif expandida
  const [modalSimular, setModalSimular] = useState(false)
  const [formSimular, setFormSimular] = useState(FORM_EMPTY)
  const [modalVincular, setModalVincular] = useState(null)  // notif a vincular
  const [emailLocal, setEmailLocal] = useState(config.emailMedico)
  const [savedMsg, setSavedMsg] = useState('')

  // Endereço de recebimento gerado (simulado)
  const emailRecebimento = `pje-${(currentUser?.id || 'user').slice(0, 8)}@notif.sistemalaudos.com.br`

  // Filtros aplicados
  const filtered = notificacoes.filter(n => {
    if (filtroTipo !== 'todos' && n.tipo !== filtroTipo) return false
    if (filtroLida && n.lida) return false
    if (searchProcesso && !n.processo.toLowerCase().includes(searchProcesso.toLowerCase())) return false
    return true
  })

  function handleSaveConfig() {
    salvarConfig({ emailMedico: emailLocal, ativo: !!emailLocal })
    setSavedMsg('Configuração salva!')
    setTimeout(() => setSavedMsg(''), 3000)
  }

  function handleSimular() {
    simularRecebimento(formSimular)
    setModalSimular(false)
    setFormSimular(FORM_EMPTY)
    setAba('notificacoes')
  }

  function handleVincularLaudo(laudoId) {
    if (!modalVincular) return
    vincularLaudo(modalVincular.id, laudoId)
    setModalVincular(null)
  }

  return (
    <div className={styles.page}>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Sincronização de E-mail / PJe</h1>
          <p className={styles.sub}>
            Receba notificações do PJe diretamente neste sistema — sem abrir Gmail ou Outlook.
          </p>
        </div>
        <div className={styles.headerActions}>
          {naoLidas > 0 && (
            <button className={styles.marcarBtn} onClick={marcarTodasLidas}>
              Marcar todas como lidas ({naoLidas})
            </button>
          )}
          <Button variant="outline" onClick={() => setModalSimular(true)}>
            + Simular Notificação
          </Button>
        </div>
      </div>

      {/* ── Abas ─────────────────────────────────────────────────────────── */}
      <div className={styles.abas}>
        <button
          className={`${styles.aba} ${aba === 'notificacoes' ? styles.abaAtiva : ''}`}
          onClick={() => setAba('notificacoes')}
        >
          Notificações
          {naoLidas > 0 && <span className={styles.badge}>{naoLidas}</span>}
        </button>
        <button
          className={`${styles.aba} ${aba === 'configuracao' ? styles.abaAtiva : ''}`}
          onClick={() => setAba('configuracao')}
        >
          Configuração e Integração
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          ABA: NOTIFICAÇÕES
      ════════════════════════════════════════════════════════════════════ */}
      {aba === 'notificacoes' && (
        <div className={styles.notifSection}>
          {/* Filtros */}
          <div className={styles.filtros}>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Buscar por nº do processo..."
              value={searchProcesso}
              onChange={e => setSearchProcesso(e.target.value)}
            />
            <select
              className={styles.selectFiltro}
              value={filtroTipo}
              onChange={e => setFiltroTipo(e.target.value)}
            >
              <option value="todos">Todos os tipos</option>
              {Object.entries(TIPO_META).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <label className={styles.checkLabel}>
              <input
                type="checkbox"
                checked={filtroLida}
                onChange={e => setFiltroLida(e.target.checked)}
              />
              Somente não lidas
            </label>
          </div>

          {/* Lista */}
          {filtered.length === 0 ? (
            <div className={styles.empty}>
              <span style={{ fontSize: 40 }}>📭</span>
              <p>Nenhuma notificação encontrada.</p>
              <p>Configure o encaminhamento de e-mail na aba <strong>Configuração</strong> para começar a receber alertas do PJe aqui.</p>
            </div>
          ) : (
            <div className={styles.feed}>
              {filtered.map(n => {
                const meta = TIPO_META[n.tipo] || TIPO_META.outro
                const prazo = formatPrazo(n.prazo)
                const isOpen = expandida === n.id

                return (
                  <div
                    key={n.id}
                    className={`${styles.card} ${!n.lida ? styles.cardNaoLida : ''} ${n.urgente ? styles.cardUrgente : ''}`}
                  >
                    <div className={styles.cardTop} onClick={() => {
                      setExpandida(isOpen ? null : n.id)
                      if (!n.lida) marcarLida(n.id)
                    }}>
                      <div className={styles.cardLeft}>
                        <span className={`${styles.tipoBadge} ${styles[`tipo_${meta.color}`]}`}>
                          {meta.icon} {meta.label}
                        </span>
                        {n.urgente && <span className={styles.urgenteTag}>⚠️ URGENTE</span>}
                        {!n.lida && <span className={styles.naoLidaDot} title="Não lida" />}
                      </div>
                      <span className={styles.dataReceb}>{formatDate(n.dataRecebimento)}</span>
                    </div>

                    <div className={styles.cardBody} onClick={() => {
                      setExpandida(isOpen ? null : n.id)
                      if (!n.lida) marcarLida(n.id)
                    }}>
                      <p className={styles.processo}>{n.processo}</p>
                      <p className={styles.tribunal}>{n.tribunal}</p>
                      <p className={styles.assunto}>{n.assunto}</p>

                      {prazo && (
                        <span className={`${styles.prazoTag} ${prazo.critical ? styles.prazoCritical : ''}`}>
                          🗓 {prazo.text}
                        </span>
                      )}
                    </div>

                    {/* Expansão */}
                    {isOpen && (
                      <div className={styles.cardExpanded}>
                        <div className={styles.expandedBody}>
                          <p className={styles.expandedLabel}>Origem</p>
                          <p className={styles.expandedVal}>{n.origemEmail}</p>
                          <p className={styles.expandedLabel}>Resumo</p>
                          <p className={styles.expandedVal}>{n.resumo}</p>
                          {n.laudoId && (
                            <div className={styles.laudoVinculado}>
                              <span>✅ Laudo vinculado</span>
                              <button
                                className={styles.linkBtn}
                                onClick={() => navigate(`/revisar-laudo/${n.laudoId}`)}
                              >
                                Abrir laudo →
                              </button>
                            </div>
                          )}
                        </div>
                        <div className={styles.cardActions}>
                          {!n.laudoId && (
                            <Button variant="primary" size="sm" onClick={() => setModalVincular(n)}>
                              Vincular a laudo existente
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/atribuir-laudo?processo=${encodeURIComponent(n.processo)}`)}
                          >
                            Criar novo laudo
                          </Button>
                          <button className={styles.deleteBtn} onClick={() => excluirNotificacao(n.id)} title="Remover">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
                              <path d="M9 6V4h6v2"/>
                            </svg>
                            Remover
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          ABA: CONFIGURAÇÃO E INTEGRAÇÃO
      ════════════════════════════════════════════════════════════════════ */}
      {aba === 'configuracao' && (
        <div className={styles.configSection}>

          {/* ── Passo 1: Endereço de recebimento ── */}
          <div className={styles.configCard}>
            <div className={styles.configCardHeader}>
              <span className={styles.stepBadge}>1</span>
              <div>
                <h3>Endereço de recebimento do sistema</h3>
                <p>Este é o e-mail gerado para o seu perfil. Você vai redirecionar os e-mails do PJe para este endereço.</p>
              </div>
            </div>
            <div className={styles.emailBox}>
              <span className={styles.emailAddr}>{emailRecebimento}</span>
              <button
                className={styles.copyBtn}
                onClick={() => { navigator.clipboard?.writeText(emailRecebimento); alert('Copiado!') }}
              >
                Copiar
              </button>
            </div>
            <p className={styles.configNote}>
              ⚠️ <strong>Atenção:</strong> Este endereço é exclusivo para receber notificações do PJe.
              Para que a integração funcione em produção, é necessário configurar um serviço de e-mail inbound
              (SendGrid, AWS SES ou similar) — veja o Passo 4.
            </p>
          </div>

          {/* ── Passo 2: E-mail do médico ── */}
          <div className={styles.configCard}>
            <div className={styles.configCardHeader}>
              <span className={styles.stepBadge}>2</span>
              <div>
                <h3>Seu e-mail cadastrado no PJe</h3>
                <p>Informe o e-mail que você usa no PJe para receber as notificações de novas perícias.</p>
              </div>
            </div>
            <div className={styles.emailInputRow}>
              <input
                className={styles.emailInput}
                type="email"
                placeholder="seu.email@gmail.com ou outlook.com"
                value={emailLocal}
                onChange={e => setEmailLocal(e.target.value)}
              />
              <Button variant="primary" onClick={handleSaveConfig} disabled={!emailLocal}>
                Salvar
              </Button>
              {savedMsg && <span className={styles.savedMsg}>✓ {savedMsg}</span>}
            </div>
            {config.ativo && (
              <div className={styles.statusAtivo}>
                <span className={styles.dotAtivo} /> Encaminhamento ativo para: <strong>{config.emailMedico}</strong>
              </div>
            )}
          </div>

          {/* ── Passo 3: Configurar encaminhamento ── */}
          <div className={styles.configCard}>
            <div className={styles.configCardHeader}>
              <span className={styles.stepBadge}>3</span>
              <div>
                <h3>Configure o encaminhamento automático no seu e-mail</h3>
                <p>Os e-mails do PJe precisam ser redirecionados automaticamente para o endereço gerado no Passo 1.</p>
              </div>
            </div>
            <EmailInstructions emailRecebimento={emailRecebimento} />
          </div>

          {/* ── Passo 4: Backend/Webhook (técnico) ── */}
          <div className={styles.configCard}>
            <div className={styles.configCardHeader}>
              <span className={styles.stepBadge}>4</span>
              <div>
                <h3>Integração do backend (para desenvolvedores)</h3>
                <p>Como o servidor processa os e-mails recebidos e cria notificações neste sistema.</p>
              </div>
            </div>
            <BackendDocs emailRecebimento={emailRecebimento} />
          </div>

        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          MODAL: SIMULAR NOTIFICAÇÃO
      ════════════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={modalSimular}
        onClose={() => { setModalSimular(false); setFormSimular(FORM_EMPTY) }}
        title="Simular recebimento de notificação PJe"
        size="md"
      >
        <p className={styles.modalHint}>
          Útil para testar o fluxo sem depender de um e-mail real do tribunal.
        </p>
        <div className={styles.simForm}>
          <div className={styles.simRow2}>
            <div className={styles.simField}>
              <label>Tipo</label>
              <select value={formSimular.tipo} onChange={e => setFormSimular(f => ({ ...f, tipo: e.target.value }))}>
                {Object.entries(TIPO_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div className={styles.simField}>
              <label>Urgente?</label>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={formSimular.urgente}
                  onChange={e => setFormSimular(f => ({ ...f, urgente: e.target.checked }))}
                />
                Sim, marcar como urgente
              </label>
            </div>
          </div>
          <div className={styles.simField}>
            <label>Nº do Processo *</label>
            <input
              placeholder="1234567-89.2024.8.26.0001"
              value={formSimular.processo}
              onChange={e => setFormSimular(f => ({ ...f, processo: e.target.value }))}
            />
          </div>
          <div className={styles.simField}>
            <label>Tribunal / Vara</label>
            <input
              placeholder="TJSP – 3ª Vara Cível"
              value={formSimular.tribunal}
              onChange={e => setFormSimular(f => ({ ...f, tribunal: e.target.value }))}
            />
          </div>
          <div className={styles.simField}>
            <label>Assunto do e-mail</label>
            <input
              placeholder="[PJe] Nova perícia médica atribuída – Processo..."
              value={formSimular.assunto}
              onChange={e => setFormSimular(f => ({ ...f, assunto: e.target.value }))}
            />
          </div>
          <div className={styles.simField}>
            <label>Resumo / corpo do e-mail</label>
            <textarea
              rows={3}
              placeholder="Vossa Senhoria foi designado como perito médico para o processo acima..."
              value={formSimular.resumo}
              onChange={e => setFormSimular(f => ({ ...f, resumo: e.target.value }))}
            />
          </div>
          <div className={styles.simField}>
            <label>Data limite do prazo (opcional)</label>
            <input
              type="date"
              value={formSimular.prazo}
              onChange={e => setFormSimular(f => ({ ...f, prazo: e.target.value ? new Date(e.target.value).toISOString() : '' }))}
            />
          </div>
        </div>
        <div className={styles.modalFooter}>
          <Button variant="outline" onClick={() => { setModalSimular(false); setFormSimular(FORM_EMPTY) }}>Cancelar</Button>
          <Button variant="primary" onClick={handleSimular} disabled={!formSimular.processo}>
            Simular recebimento
          </Button>
        </div>
      </Modal>

      {/* ════════════════════════════════════════════════════════════════════
          MODAL: VINCULAR LAUDO
      ════════════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={!!modalVincular}
        onClose={() => setModalVincular(null)}
        title="Vincular notificação a um laudo"
        size="md"
      >
        <p className={styles.modalHint}>
          Processo: <strong>{modalVincular?.processo}</strong>
        </p>
        {laudos.length === 0 ? (
          <p className={styles.empty}>Nenhum laudo cadastrado ainda.</p>
        ) : (
          <div className={styles.laudoPickList}>
            {laudos.map(l => (
              <button key={l.id} className={styles.laudoPickItem} onClick={() => handleVincularLaudo(l.id)}>
                <span className={styles.laudoPickNum}>{l.numero}</span>
                <span>{l.paciente?.nome}</span>
                <span className={styles.laudoPickProc}>{l.paciente?.processo}</span>
              </button>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}

// ── Sub-componente: Instruções Gmail / Outlook ───────────────────────────────

function EmailInstructions({ emailRecebimento }) {
  const [aba, setAba] = useState('gmail')
  return (
    <div className={styles.instrucoes}>
      <div className={styles.instrAba}>
        <button className={`${styles.instrBtn} ${aba === 'gmail' ? styles.instrBtnAtivo : ''}`} onClick={() => setAba('gmail')}>Gmail</button>
        <button className={`${styles.instrBtn} ${aba === 'outlook' ? styles.instrBtnAtivo : ''}`} onClick={() => setAba('outlook')}>Outlook</button>
      </div>

      {aba === 'gmail' && (
        <ol className={styles.steps}>
          <li>Abra o Gmail e clique em <strong>Configurações</strong> (ícone ⚙️) → <strong>"Ver todas as configurações"</strong>.</li>
          <li>Vá para a aba <strong>"Encaminhamento e POP/IMAP"</strong>.</li>
          <li>Clique em <strong>"Adicionar endereço de encaminhamento"</strong> e cole o endereço:<br />
            <code className={styles.codeBlock}>{emailRecebimento}</code>
          </li>
          <li>O Gmail enviará um e-mail de confirmação — clique no link para validar.</li>
          <li>De volta em Configurações, marque <strong>"Encaminhar uma cópia de e-mail recebido para"</strong> e selecione o endereço acima.</li>
          <li><strong>Opcional e recomendado:</strong> Crie um filtro para encaminhar <em>somente</em> e-mails com remetente <code>@pje.jus.br</code> ou <code>@tjsp.jus.br</code>.<br />
            Isso evita que e-mails pessoais sejam enviados ao sistema.</li>
        </ol>
      )}

      {aba === 'outlook' && (
        <ol className={styles.steps}>
          <li>Abra o Outlook e acesse <strong>Configurações</strong> → <strong>"Ver todas as configurações do Outlook"</strong>.</li>
          <li>Vá em <strong>Correio → Encaminhamento</strong>.</li>
          <li>Habilite a opção <strong>"Habilitar encaminhamento"</strong> e insira:<br />
            <code className={styles.codeBlock}>{emailRecebimento}</code>
          </li>
          <li>Clique em <strong>Salvar</strong>.</li>
          <li><strong>Opcional e recomendado:</strong> Configure uma regra em <strong>Regras de caixa de entrada</strong> para encaminhar apenas mensagens de <code>pje.jus.br</code>, evitando o envio de e-mails pessoais.</li>
        </ol>
      )}
    </div>
  )
}

// ── Sub-componente: Documentação técnica de backend ──────────────────────────

function BackendDocs({ emailRecebimento }) {
  const [tab, setTab] = useState('fluxo')
  return (
    <div className={styles.techDocs}>
      <div className={styles.instrAba}>
        <button className={`${styles.instrBtn} ${tab === 'fluxo' ? styles.instrBtnAtivo : ''}`} onClick={() => setTab('fluxo')}>Fluxo geral</button>
        <button className={`${styles.instrBtn} ${tab === 'sendgrid' ? styles.instrBtnAtivo : ''}`} onClick={() => setTab('sendgrid')}>SendGrid</button>
        <button className={`${styles.instrBtn} ${tab === 'ses' ? styles.instrBtnAtivo : ''}`} onClick={() => setTab('ses')}>AWS SES</button>
        <button className={`${styles.instrBtn} ${tab === 'payload' ? styles.instrBtnAtivo : ''}`} onClick={() => setTab('payload')}>Payload da API</button>
      </div>

      {tab === 'fluxo' && (
        <div className={styles.fluxo}>
          <div className={styles.fluxoStep}><span className={styles.fluxoIcon}>📧</span><span>PJe envia e-mail de notificação ao médico</span></div>
          <div className={styles.fluxoArrow}>↓</div>
          <div className={styles.fluxoStep}><span className={styles.fluxoIcon}>📤</span><span>Gmail/Outlook redireciona automaticamente para <code>{emailRecebimento}</code></span></div>
          <div className={styles.fluxoArrow}>↓</div>
          <div className={styles.fluxoStep}><span className={styles.fluxoIcon}>🔌</span><span>SendGrid Inbound Parse ou AWS SES recebe o e-mail e dispara webhook (HTTP POST)</span></div>
          <div className={styles.fluxoArrow}>↓</div>
          <div className={styles.fluxoStep}><span className={styles.fluxoIcon}>⚙️</span><span>Backend extrai número do processo, tipo de notificação e prazo via regex</span></div>
          <div className={styles.fluxoArrow}>↓</div>
          <div className={styles.fluxoStep}><span className={styles.fluxoIcon}>💾</span><span>Backend salva a notificação no banco e retorna via API para este sistema</span></div>
          <div className={styles.fluxoArrow}>↓</div>
          <div className={styles.fluxoStep}><span className={styles.fluxoIcon}>🔔</span><span>Card aparece neste menu com todos os dados do processo</span></div>
        </div>
      )}

      {tab === 'sendgrid' && (
        <div>
          <ol className={styles.steps}>
            <li>Crie uma conta no <strong>SendGrid</strong> e acesse <strong>Settings → Inbound Parse</strong>.</li>
            <li>Configure um MX record DNS para o domínio de recebimento:<br />
              <code className={styles.codeBlock}>MX  notif.sistemalaudos.com.br  →  mx.sendgrid.net  (prioridade 10)</code>
            </li>
            <li>No painel do SendGrid, adicione o hostname <code>notif.sistemalaudos.com.br</code> apontando para sua URL de webhook:<br />
              <code className={styles.codeBlock}>POST https://sua-api.com/webhook/email-pje</code>
            </li>
            <li>O SendGrid irá fazer um POST com os dados do e-mail em <code>multipart/form-data</code>, incluindo campos <code>from</code>, <code>subject</code>, <code>text</code> e <code>html</code>.</li>
            <li>No seu backend (Node.js / Python / etc.), parse o campo <code>subject</code> e <code>text</code> para extrair o número do processo com regex:<br />
              <code className={styles.codeBlock}>{`/\\d{7}-\\d{2}\\.\\d{4}\\.\\d\\.\\d{2}\\.\\d{4}/`}</code>
            </li>
          </ol>
        </div>
      )}

      {tab === 'ses' && (
        <ol className={styles.steps}>
          <li>No console AWS, vá em <strong>SES → Email receiving → Rule sets</strong> e crie um novo rule set.</li>
          <li>Adicione uma regra com ação <strong>"SNS"</strong> ou <strong>"Lambda"</strong>.</li>
          <li>Configure o domínio com MX record apontando para <code>inbound-smtp.&lt;region&gt;.amazonaws.com</code>.</li>
          <li>Na Lambda, o evento terá <code>Records[0].ses.mail</code> com <code>subject</code>, <code>from</code>, <code>headers</code> e o body via S3 (configure um bucket de staging).</li>
          <li>A Lambda extrai o número do processo, consulta o banco de dados para verificar qual médico é o destinatário e insere uma nova notificação.</li>
          <li>Via API Gateway ou AppSync, o frontend consulta as notificações em tempo real (polling ou WebSocket).</li>
        </ol>
      )}

      {tab === 'payload' && (
        <div>
          <p className={styles.techNote}>Payload que seu backend deve enviar para este sistema (via API REST ou localStorage direto neste protótipo):</p>
          <pre className={styles.codeJson}>{`POST /api/notificacoes

{
  "tipo": "nova_pericia",          // nova_pericia | intimacao | prazo | laudo_devolvido | outro
  "processo": "1234567-89.2024.8.26.0001",
  "tribunal": "TJSP – 5ª Vara Cível",
  "assunto": "[PJe] Nova perícia atribuída",
  "resumo": "Texto extraído do corpo do e-mail...",
  "origemEmail": "noreply@pje.tjsp.jus.br",
  "dataRecebimento": "2024-11-15T10:30:00.000Z",  // ISO 8601
  "prazo": "2024-12-15T23:59:59.000Z",             // null se não houver
  "urgente": false
}`}</pre>
          <p className={styles.techNote} style={{ marginTop: 12 }}>
            Regex sugerida para extrair o número do processo a partir do assunto ou corpo do e-mail PJe:
          </p>
          <pre className={styles.codeJson}>{`// JavaScript
const REGEX_PROCESSO = /\\d{7}-\\d{2}\\.\\d{4}\\.\\d\\.\\d{2}\\.\\d{4}/g

// Python
import re
REGEX_PROCESSO = r'\\d{7}-\\d{2}\\.\\d{4}\\.\\d\\.\\d{2}\\.\\d{4}'
matches = re.findall(REGEX_PROCESSO, email_body)`}</pre>
        </div>
      )}
    </div>
  )
}
