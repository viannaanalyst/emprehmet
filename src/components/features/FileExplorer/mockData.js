export const PACIENTE_MOCK = {
  id: 'pac-001',
  nome: 'Maria Silva Santos',
  cpf: '123.456.789-00',
}

export const PASTAS = [
  { id: 'laudos', label: 'Laudos', icon: 'FileText' },
  { id: 'exames', label: 'Exames (Imagens)', icon: 'Image' },
  { id: 'documentos', label: 'Documentos Pessoais', icon: 'FolderOpen' },
  { id: 'anamneses', label: 'Anamneses', icon: 'ClipboardList' },
]

export const ARQUIVOS_MOCK = [
  {
    id: 'arq-001',
    nome: 'Laudo_Pericial_2024_001.pdf',
    tipo: 'pdf',
    pasta: 'laudos',
    tamanho: '245 KB',
    dataUpload: '2024-01-15',
    url: '/mock/laudo-001.pdf',
  },
  {
    id: 'arq-002',
    nome: 'Laudo_Pericial_2024_002.pdf',
    tipo: 'pdf',
    pasta: 'laudos',
    tamanho: '312 KB',
    dataUpload: '2024-01-18',
    url: '/mock/laudo-002.pdf',
  },
  {
    id: 'arq-003',
    nome: 'Termo_Responsabilidade.docx',
    tipo: 'docx',
    pasta: 'documentos',
    tamanho: '45 KB',
    dataUpload: '2024-01-10',
    url: '/mock/termo.docx',
  },
  {
    id: 'arq-004',
    nome: 'RG_Paciente.pdf',
    tipo: 'pdf',
    pasta: 'documentos',
    tamanho: '1.2 MB',
    dataUpload: '2024-01-08',
    url: '/mock/rg.pdf',
  },
  {
    id: 'arq-005',
    nome: 'Raio_X_Torax.jpg',
    tipo: 'imagem',
    pasta: 'exames',
    tamanho: '2.8 MB',
    dataUpload: '2024-01-20',
    url: 'https://picsum.photos/seed/xray/400/300',
  },
  {
    id: 'arq-006',
    nome: 'Eletrocardiograma.jpg',
    tipo: 'imagem',
    pasta: 'exames',
    tamanho: '1.5 MB',
    dataUpload: '2024-01-21',
    url: 'https://picsum.photos/seed/ecg/400/300',
  },
  {
    id: 'arq-007',
    nome: 'Atestado_Medico.docx',
    tipo: 'docx',
    pasta: 'documentos',
    tamanho: '32 KB',
    dataUpload: '2024-01-12',
    url: '/mock/atestado.docx',
  },
  {
    id: 'arq-008',
    nome: 'Anamnese_Completa.pdf',
    tipo: 'pdf',
    pasta: 'anamneses',
    tamanho: '156 KB',
    dataUpload: '2024-01-05',
    url: '/mock/anamnese.pdf',
  },
  {
    id: 'arq-009',
    nome: 'Exame_Sangue.png',
    tipo: 'imagem',
    pasta: 'exames',
    tamanho: '890 KB',
    dataUpload: '2024-01-22',
    url: 'https://picsum.photos/seed/blood/400/300',
  },
  {
    id: 'arq-010',
    nome: 'Historia_Clinica.docx',
    tipo: 'docx',
    pasta: 'anamneses',
    tamanho: '78 KB',
    dataUpload: '2024-01-03',
    url: '/mock/historia.docx',
  },
  {
    id: 'arq-011',
    nome: 'Laudo_Final_2024.pdf',
    tipo: 'pdf',
    pasta: 'laudos',
    tamanho: '298 KB',
    dataUpload: '2024-01-25',
    url: '/mock/laudo-003.pdf',
  },
  {
    id: 'arq-012',
    nome: 'CT_Torax.jpg',
    tipo: 'imagem',
    pasta: 'exames',
    tamanho: '4.2 MB',
    dataUpload: '2024-01-23',
    url: 'https://picsum.photos/seed/ct/400/300',
  },
]

export const getIconPorTipo = (tipo) => {
  switch (tipo) {
    case 'pdf':
      return { cor: 'text-red-500', bg: 'bg-red-50' }
    case 'docx':
      return { cor: 'text-blue-600', bg: 'bg-blue-50' }
    case 'imagem':
      return { cor: 'text-green-600', bg: 'bg-green-50' }
    default:
      return { cor: 'text-gray-500', bg: 'bg-gray-50' }
  }
}
