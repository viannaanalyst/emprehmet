# Sistema de Laudos Periciais

Sistema web para médicos/peritos judiciais gerenciarem laudos periciais e notificações do PJe (Processo Judicial Eletrônico). Desenvolvido com Vite + React 18, sem backend — todo o estado é persistido em `localStorage`.

---

## Sumário

1. [Visão Geral](#visão-geral)
2. [Stack e Dependências](#stack-e-dependências)
3. [Como Executar](#como-executar)
4. [Estrutura de Arquivos](#estrutura-de-arquivos)
5. [Autenticação](#autenticação)
6. [Módulos / Páginas](#módulos--páginas)
   - [Dashboard](#dashboard)
   - [Visualização de Laudos](#visualização-de-laudos)
   - [Verificar Laudos](#verificar-laudos)
   - [Atribuir Laudo](#atribuir-laudo)
   - [Revisão e Finalização](#revisão-e-finalização)
   - [Condições / Doenças](#condições--doenças)
   - [Notificações PJe](#notificações-pje)
7. [Contextos (Estado Global)](#contextos-estado-global)
8. [Modelos de Dados](#modelos-de-dados)
9. [Utilitários](#utilitários)
10. [Exportação de Documentos](#exportação-de-documentos)
11. [Biblioteca de Doenças](#biblioteca-de-doenças)
12. [Persistência (localStorage)](#persistência-localstorage)
13. [Rotas](#rotas)
14. [Decisões de Arquitetura](#decisões-de-arquitetura)
15. [Build e Performance](#build-e-performance)

---

## Visão Geral

O problema central que o sistema resolve: peritos perdiam muito tempo copiando manualmente descrições médicas para laudos. Com este sistema, o perito seleciona doenças de uma biblioteca CID-10 e as descrições são inseridas automaticamente no laudo, já personalizadas com o nome do paciente.

**Funcionalidades principais:**
- Login com sessão de 8h e hash SHA-256 de senha
- CRUD completo de laudos com numeração automática (`LAU-YYYY-NNNN`)
- Biblioteca de doenças editável pelo usuário
- Editor de texto rico (TipTap) para revisão e formatação final do laudo
- Exportação de laudos em **PDF compatível com o PJe** (texto real, pesquisável, sem senha, margens 3cm/2cm)
- Exportação em **Word (.docx)**
- Feed de notificações PJe (novas perícias, intimações, prazos) sincronizado por e-mail

---

## Stack e Dependências

| Pacote | Versão | Uso |
|--------|--------|-----|
| `react` + `react-dom` | ^18.3 | UI |
| `react-router-dom` | ^6.22 | Roteamento SPA |
| `uuid` | ^9.0 | Geração de IDs únicos |
| `@tiptap/react` | ^3.20 | Editor de texto rico |
| `@tiptap/starter-kit` | ^3.20 | Extensões básicas do TipTap |
| `@tiptap/extension-underline` | ^3.20 | Sublinhado no editor |
| `@tiptap/extension-text-align` | ^3.20 | Alinhamento de texto |
| `pdfmake` | ^0.3.7 | Geração de PDF com texto real |
| `html-to-pdfmake` | ^2.5.33 | Conversão HTML → pdfmake |
| `docx` | ^9.6.1 | Geração de arquivos .docx |
| `file-saver` | ^2.0.5 | Download de arquivos no browser |
| `vite` | ^5.4 | Build tool |
| `@vitejs/plugin-react` | ^4.3 | Plugin JSX para Vite |

---

## Como Executar

```bash
# Na pasta do projeto
npm install
npm run dev
# Acesse http://localhost:5173

# Build de produção
npm run build
npm run preview
```

**Credenciais padrão (seed automático no primeiro acesso):**
- Usuário: `admin`
- Senha: `admin123`

---

## Estrutura de Arquivos

```
src/
├── App.jsx                          ← Roteador raiz + providers
├── main.jsx                         ← Ponto de entrada React
├── styles/
│   └── global.css                   ← Variáveis CSS globais (--primary, --grey-*, etc.)
│
├── constants/
│   └── diseaseLibrary.js            ← Seed: 15 doenças CID-10 com descrições
│
├── contexts/
│   ├── AuthContext.jsx              ← Login, logout, sessão 8h, SHA-256
│   ├── LaudoContext.jsx             ← CRUD laudos + máquina de status
│   ├── DiseaseContext.jsx           ← Biblioteca de doenças + busca/filtro
│   └── NotificacoesContext.jsx      ← Notificações PJe + config de e-mail
│
├── hooks/
│   └── useLocalStorage.js           ← Hook genérico para localStorage
│
├── utils/
│   ├── storage.js                   ← Helpers read/write localStorage + KEYS
│   ├── laudoBuilder.js              ← Monta texto do laudo + resolve tokens
│   ├── exportPdf.js                 ← Exportação PDF (pdfmake, PJe-compatível)
│   └── exportDocx.js                ← Exportação Word (docx + DOMParser)
│
├── router/
│   └── ProtectedRoute.jsx           ← Redireciona para /login se não autenticado
│
├── pages/
│   ├── LoginPage/
│   ├── DashboardPage/
│   ├── VisualizacaoPage/
│   ├── VerificarLaudosPage/
│   ├── AtribuirLaudoPage/
│   ├── RevisaoLaudoPage/
│   ├── CondicoesPage/
│   └── EmailSyncPage/
│
└── components/
    ├── layout/
    │   ├── MainLayout/              ← Shell: Sidebar + Topbar + <Outlet>
    │   ├── Sidebar/                 ← Navegação lateral com badge de não lidas
    │   └── Topbar/                  ← Barra superior com nome do usuário
    ├── ui/
    │   ├── Button/
    │   ├── Input/
    │   ├── Modal/
    │   └── Badge/
    ├── laudo/
    │   ├── LaudoCard/               ← Card de laudo na lista
    │   ├── LaudoForm/               ← Formulário de 5 etapas
    │   ├── LaudoPreview/            ← Preview em texto puro
    │   └── RichTextEditor/          ← Editor TipTap com toolbar completa
    └── disease/
        ├── DiseaseLibraryPanel/     ← Painel esquerdo: biblioteca pesquisável
        ├── DiseaseCard/             ← Card de uma doença
        └── SelectedDiseasesList/    ← Painel direito: doenças selecionadas
```

---

## Autenticação

**Arquivo:** `src/contexts/AuthContext.jsx`

- Senha hasheada com **SHA-256** via `crypto.subtle.digest` (Web Crypto API nativa)
- Sessão salva em `localStorage` com timestamp; expira após **8 horas**
- Ao iniciar, verifica se a sessão ainda é válida antes de restaurar o usuário
- **Seed automático:** se não houver usuários cadastrados, cria `admin / admin123` na primeira inicialização
- Expõe: `currentUser`, `login(username, password)`, `logout()`, `register(username, password, nome)`

---

## Módulos / Páginas

### Dashboard

**Rota:** `/dashboard`

Cards de resumo mostrando:
- Total de laudos cadastrados
- Laudos em análise
- Laudos concluídos
- Laudos arquivados

### Visualização de Laudos

**Rota:** `/visualizacao`

Tabela completa de todos os laudos com:
- Filtros por status e busca por texto (número, paciente, processo)
- Modal de preview do conteúdo do laudo
- Botão para abrir a tela de Revisão/Finalização
- Botão para deletar laudo (com confirmação)

### Verificar Laudos

**Rota:** `/verificar-laudos`

Visão Kanban-lite com laudos agrupados por status:

```
Rascunho → Em Análise → Concluído → Arquivado
```

- Botões para avançar ou reverter status
- **Arquivado é irreversível**
- Ao concluir, registra `concluidoEm` com timestamp

### Atribuir Laudo

**Rota:** `/atribuir-laudo`

Formulário guiado em **5 etapas:**

| Etapa | Conteúdo |
|-------|----------|
| 1 | Dados do paciente: nome, CPF, data de nascimento, número do processo |
| 2 | Introdução (textarea livre) |
| 3 | Seleção de doenças da biblioteca |
| 4 | Conclusão (textarea livre) |
| 5 | Preview completo + botões Salvar Rascunho / Enviar para Análise |

**Etapa 3 — Seleção de Doenças:**
- Painel esquerdo: biblioteca pesquisável por nome ou código CID
- Filtro por categoria
- Painel direito: doenças adicionadas, opção de remover cada uma
- Preview em tempo real do texto que será gerado

Ao finalizar, `assembleText()` monta o texto do laudo resolvendo os tokens `{{nome_paciente}}` e `{{codigo}}`.

### Revisão e Finalização

**Rota:** `/revisar-laudo/:id`

Tela de edição avançada de um laudo existente:

**Coluna esquerda:** informações do paciente, número do laudo, status, campo CRM do perito (persistido em `localStorage` como `sl_medico_crm`)

**Coluna direita:** editor TipTap com toolbar completa:
- Negrito, Itálico, Sublinhado
- Títulos H2 e H3
- Lista com marcadores e numerada
- Alinhamento: esquerda, centro, direita
- Separador horizontal
- Desfazer / Refazer

**Ações disponíveis:**
- **Salvar edições** — persiste o HTML editado em `laudo.textoHtml`
- **Exportar PDF** — gera arquivo `.pdf` compatível com PJe
- **Exportar Word** — gera arquivo `.docx`

O bloco de assinatura eletrônica é inserido automaticamente em ambas as exportações:

```
_______________________________
Dr(a). [Nome do Perito]
CRM: [número]
Perito Judicial
```

### Condições / Doenças

**Rota:** `/condicoes`

CRUD completo da biblioteca de doenças:
- Tabela com todas as doenças (nome, CID, categoria, trecho da descrição)
- Modal de criação/edição com campos: nome, código CID, categoria (autocomplete das categorias existentes), descrição
- Dica de tokens disponíveis: `{{nome_paciente}}` e `{{codigo}}`
- Confirmação antes de deletar
- Doenças adicionadas aqui aparecem imediatamente na etapa 3 do formulário de laudo

### Notificações PJe

**Rota:** `/email-sync`

Duas abas:

**Aba Notificações:**
- Feed de notificações recebidas via e-mail do PJe
- Filtros: tipo (nova perícia, intimação, prazo, outros), somente não lidas, busca por número de processo
- Card expansível mostrando: número do processo, tribunal, assunto, resumo completo, prazo
- Ações por card: marcar como lida, vincular a laudo existente, criar novo laudo, deletar
- Botão "Marcar todas como lidas"
- Badge na sidebar mostra quantidade de notificações não lidas

**Aba Configuração:**
Guia de 4 passos para configurar o encaminhamento de e-mails:

1. **E-mail de encaminhamento** — endereço gerado pelo sistema para receber os e-mails do PJe
2. **E-mail do médico** — onde o perito recebe os e-mails atualmente (campo editável, salvo localmente)
3. **Instruções de encaminhamento** — passo a passo para Gmail e Outlook
4. **Documentação técnica** — arquitetura do webhook (SendGrid Inbound Parse / AWS SES), payload JSON de entrada, regex para extração do número do processo

**Modal de simulação:** permite criar notificações fictícias para testar o sistema sem precisar de e-mails reais.

---

## Contextos (Estado Global)

### AuthContext

```jsx
const { currentUser, login, logout, register } = useAuth()
```

### LaudoContext

```jsx
const {
  laudos,
  createLaudo, updateLaudo, deleteLaudo, getLaudoById,
  advanceStatus, revertStatus,
  STATUS_FLOW  // ['rascunho', 'em_analise', 'concluido', 'arquivado']
} = useLaudos()
```

### DiseaseContext

```jsx
const {
  diseases,
  filteredDiseases,
  searchTerm, setSearchTerm,
  selectedCategory, setSelectedCategory,
  addDisease, updateDisease, deleteDisease
} = useDiseases()
```

### NotificacoesContext

```jsx
const {
  notificacoes,
  config,
  naoLidas,                        // número para o badge da sidebar
  marcarLida, marcarTodasLidas,
  excluirNotificacao,
  vincularLaudo,                   // vincula notif a um laudoId
  simularRecebimento,              // cria notif de teste
  salvarConfig                     // salva emailMedico, ativo, filtros
} = useNotificacoes()
```

**Hierarquia de providers em App.jsx:**
```
AuthProvider
  NotificacoesProvider
    DiseaseProvider
      LaudoProvider
```

---

## Modelos de Dados

### Laudo

```js
{
  id: string,                      // uuid v4
  numero: string,                  // "LAU-2026-0001"
  status: string,                  // 'rascunho' | 'em_analise' | 'concluido' | 'arquivado'
  paciente: {
    nome: string,
    cpf: string,
    dataNascimento: string,
    processo: string,
  },
  peritoId: string,
  peritoNome: string,
  doencasSelecionadas: [           // snapshot — cópia do texto no momento da seleção
    { diseaseId, nome, codigo, descricao }
  ],
  introducao: string,
  conclusao: string,
  textoLaudo: string,              // texto montado por assembleText()
  textoHtml: string | undefined,   // HTML editado no TipTap (salvo na revisão)
  criadoEm: string,                // ISO 8601
  atualizadoEm: string,
  concluidoEm: string | null,
}
```

### Doença (biblioteca)

```js
{
  id: string,
  nome: string,
  codigo: string,                  // ex: "F32"
  categoria: string,
  descricao: string,               // suporta {{nome_paciente}} e {{codigo}}
}
```

### Notificação PJe

```js
{
  id: string,
  tipo: string,                    // 'nova_pericia' | 'intimacao' | 'prazo' | 'outro'
  processo: string,                // número CNJ
  tribunal: string,
  assunto: string,
  resumo: string,
  origemEmail: string,
  dataRecebimento: string,         // ISO 8601
  prazo: string | null,            // ISO 8601
  urgente: boolean,
  lida: boolean,
  laudoId: string | null,          // vínculo com laudo, se houver
}
```

### Config de E-mail

```js
{
  emailMedico: string,
  ativo: boolean,
  filtrarSoNaoLidas: boolean,
  filtrarTipo: string,
}
```

---

## Utilitários

### `laudoBuilder.js`

**`assembleText(introducao, diseases, conclusao, paciente)`**

Função pura que monta o texto final do laudo:
1. Adiciona a introdução (se preenchida)
2. Para cada doença: resolve `{{nome_paciente}}` e `{{codigo}}`, formata como `[CID] Nome\n\ndescricao`
3. Adiciona a conclusão (se preenchida)
4. Separa cada seção com uma linha de `─` (60 caracteres)

**`generateLaudoNumber(counter)`**

Gera número sequencial: `LAU-YYYY-NNNN` (ex: `LAU-2026-0001`)

### `storage.js`

Abstração sobre `localStorage` com tratamento de erros:

```js
import { read, write, remove, KEYS } from './storage'

// Chaves disponíveis:
KEYS.USERS          // 'sl_users'
KEYS.LAUDOS         // 'sl_laudos'
KEYS.SESSION        // 'sl_session'
KEYS.DISEASE_LIB    // 'sl_disease_lib'
KEYS.LAUDO_COUNTER  // 'sl_laudo_counter'
KEYS.NOTIFICACOES   // 'sl_notificacoes'
KEYS.EMAIL_CONFIG   // 'sl_email_config'
```

---

## Exportação de Documentos

### PDF — `exportPdf.js`

Usa **pdfmake 0.3.x** com `html-to-pdfmake` para converter o HTML do TipTap em documento PDF com texto real e pesquisável.

**Regras críticas implementadas para compatibilidade PJe:**
- Sem senha (`userPassword`, `ownerPassword` ausentes)
- Sem restrições de permissão (`permissions` ausente)
- Texto real e pesquisável (pdfmake nativo, não canvas/imagem)
- Margens: 3cm esquerda/topo, 2cm direita/base
  - Em pontos pdfmake: `[85.04, 85.04, 56.69, 56.69]`
- Tamanho: A4 (210×297mm)
- Fonte: Roboto (embarcada no pdfmake)
- Imagens comprimidas via canvas API para manter o arquivo abaixo de 3MB

**API pdfmake 0.3.x (importante):**
```js
// Correto na versão 0.3.x:
pdfMake.addVirtualFileSystem(vfsFonts)

// Errado (API antiga, < 0.3):
pdfMake.vfs = vfsFonts
```

### Word — `exportDocx.js`

Usa **docx 9.6.1** com conversor HTML→DOCX implementado via `DOMParser` nativo do browser.

- Função recursiva `nodeToRuns()` converte nós HTML em `TextRun` com formatação (bold, italic, underline)
- `bodyToParagraphs()` converte parágrafos, títulos e listas em objetos `Paragraph` do docx
- Margens idênticas ao PDF: 3cm/2cm via `convertMillimetersToTwip()`
- Tamanho A4 configurado explicitamente

**Por que não usar `html-to-docx`?** Esse pacote requer Node.js (`fs`, `path`) e não funciona em browser.

---

## Biblioteca de Doenças

**Arquivo:** `src/constants/diseaseLibrary.js`

15 doenças seed em 5 categorias:

| Categoria | Códigos |
|-----------|---------|
| Transtornos Mentais | F32, F33, F40, F41, F43 |
| Sistema Osteomuscular | M54, M51, M79 |
| Sistema Nervoso | G43, G47, G54 |
| Doenças Cardiovasculares | I10, I25 |
| Fatores Socioeconômicos | Z73 |

Cada descrição é um parágrafo em linguagem pericial, pronto para uso em laudo judicial, com suporte a tokens:
- `{{nome_paciente}}` → substituído pelo nome do paciente
- `{{codigo}}` → substituído pelo código CID

As doenças do seed são carregadas no `DiseaseContext` apenas se `sl_disease_lib` estiver vazio (primeiro acesso). Após isso, o usuário pode adicionar, editar e deletar doenças livremente via `/condicoes`.

---

## Persistência (localStorage)

Todo o estado do sistema é persistido em `localStorage`. Não há backend.

| Chave | Conteúdo |
|-------|----------|
| `sl_users` | Array de usuários (username, passwordHash, nome, role) |
| `sl_session` | `{ userId, expiresAt }` — sessão atual |
| `sl_laudos` | Array de todos os laudos |
| `sl_laudo_counter` | Contador numérico para gerar `LAU-YYYY-NNNN` |
| `sl_disease_lib` | Array de doenças (biblioteca editável) |
| `sl_notificacoes` | Array de notificações PJe |
| `sl_email_config` | Config de e-mail do médico |
| `sl_medico_crm` | CRM do médico (salvo na tela de revisão) |

---

## Rotas

| Rota | Componente | Acesso |
|------|-----------|--------|
| `/login` | LoginPage | Público |
| `/dashboard` | DashboardPage | Protegido |
| `/visualizacao` | VisualizacaoPage | Protegido |
| `/verificar-laudos` | VerificarLaudosPage | Protegido |
| `/atribuir-laudo` | AtribuirLaudoPage | Protegido |
| `/condicoes` | CondicoesPage | Protegido |
| `/revisar-laudo/:id` | RevisaoLaudoPage | Protegido |
| `/email-sync` | EmailSyncPage | Protegido |
| `*` | → `/dashboard` | — |

Rotas protegidas são envolvidas por `ProtectedRoute`, que verifica `currentUser` do `AuthContext` e redireciona para `/login` se não autenticado.

---

## Decisões de Arquitetura

**Snapshot de doenças**
Ao adicionar uma doença ao laudo, o texto completo da descrição é copiado para `doencasSelecionadas` no objeto do laudo (não apenas o ID). Edições futuras na biblioteca de doenças não alteram laudos já criados. Isso é essencial para **integridade jurídica** — o documento gerado deve refletir o conteúdo exato no momento da criação.

**Sem backend**
Todo o estado está em `localStorage`. Adequado para uso por um único médico em um dispositivo. Para uso multi-usuário ou multi-dispositivo, seria necessário adicionar uma API com banco de dados.

**Editor TipTap sobre texto puro**
O laudo é primeiramente montado como texto puro pelo `laudoBuilder`. Na tela de revisão, esse texto é convertido para HTML via `plainTextToHtml()` e carregado no TipTap para edição rica. O HTML editado é salvo em `textoHtml` separadamente do `textoLaudo` original, preservando ambos.

**Arquivado é irreversível**
A transição para `arquivado` só pode ser feita avançando o status a partir de `concluido`. Não há botão de reversão para laudos arquivados, refletindo o caráter definitivo de um laudo pericial arquivado.

**Notificações por encaminhamento de e-mail**
O sistema não acessa diretamente nenhuma conta de e-mail. A arquitetura prevista é:
1. O perito configura encaminhamento automático no Gmail/Outlook para um endereço do sistema
2. Um serviço externo (SendGrid Inbound Parse ou AWS SES) recebe os e-mails e chama um webhook HTTP
3. O webhook parseia o e-mail, extrai o número do processo (regex CNJ), e cria uma notificação
4. No estado atual (MVP), as notificações são simuladas localmente via `simularRecebimento()`

---

## Build e Performance

```bash
npm run build
```

**Code splitting configurado em `vite.config.js`:**

| Chunk | Bibliotecas | Tamanho (gzip) |
|-------|------------|----------------|
| `vendor-pdf` | pdfmake, html-to-pdfmake | ~367 KB |
| `vendor-tiptap` | @tiptap/react, starter-kit, underline, text-align | ~164 KB |
| `vendor-docx` | docx, file-saver | ~101 KB |
| `index` | React, Router, lógica da app | ~504 KB |

Os chunks de PDF, TipTap e Word só são carregados quando o usuário acessa `/revisar-laudo/:id`, mantendo o carregamento inicial rápido.
