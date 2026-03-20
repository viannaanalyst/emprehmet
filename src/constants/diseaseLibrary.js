export const DISEASE_LIBRARY = [
  // ─── Transtornos Mentais e Comportamentais ───────────────────────────────────
  {
    id: 'f32',
    nome: 'Episódios Depressivos',
    codigo: 'F32',
    categoria: 'Transtornos Mentais',
    descricao: `O(A) periciando(a) {{nome_paciente}} apresenta diagnóstico de Episódios Depressivos ({{codigo}}), caracterizado por humor deprimido persistente, perda de interesse e prazer nas atividades habituais, fadiga e redução da energia. Foram identificados sinais e sintomas compatíveis com alteração do sono, dificuldade de concentração, pensamentos de inutilidade e diminuição da autoestima. A condição clínica documentada é compatível com limitação laboral significativa para atividades que exijam atenção contínua, tomada de decisões e relacionamento interpessoal sob pressão.`,
  },
  {
    id: 'f33',
    nome: 'Transtorno Depressivo Recorrente',
    codigo: 'F33',
    categoria: 'Transtornos Mentais',
    descricao: `O(A) periciando(a) {{nome_paciente}} é portador(a) de Transtorno Depressivo Recorrente ({{codigo}}), com histórico documentado de múltiplos episódios depressivos. A condição apresenta curso crônico e recidivante, com períodos de remissão parcial e agudizações. Os episódios são marcados por tristeza profunda, anedonia, alterações psicomotoras, perturbações do sono e do apetite, e comprometimento significativo da funcionalidade. O quadro clínico fundamenta a conclusão pericial de incapacidade para o trabalho durante os períodos de exacerbação.`,
  },
  {
    id: 'f40',
    nome: 'Transtornos Fóbico-Ansiosos',
    codigo: 'F40',
    categoria: 'Transtornos Mentais',
    descricao: `Constatou-se que {{nome_paciente}} é portador(a) de Transtornos Fóbico-Ansiosos ({{codigo}}), com presença de ansiedade evocada predominantemente por situações ou objetos externos específicos que atualmente não representam perigo real. O quadro é acompanhado de crises de ansiedade intensa, sintomas autonômicos (taquicardia, sudorese, tremores), comportamentos de evitação e comprometimento funcional nas atividades de vida diária e laborais. A condição é clinicamente incapacitante para funções que exponham o periciando(a) aos estímulos fóbicos.`,
  },
  {
    id: 'f41',
    nome: 'Outros Transtornos Ansiosos',
    codigo: 'F41',
    categoria: 'Transtornos Mentais',
    descricao: `O(A) periciando(a) {{nome_paciente}} apresenta diagnóstico de Outros Transtornos Ansiosos ({{codigo}}), com manifestação de ansiedade generalizada, tensão, preocupação excessiva e persistente com diversas circunstâncias. Os sintomas incluem inquietação, fadiga fácil, dificuldade de concentração, irritabilidade, tensão muscular e perturbação do sono. O quadro clínico repercute de forma significativa na capacidade laborativa, especialmente em ambientes com alta demanda cognitiva ou elevada pressão por resultados.`,
  },
  {
    id: 'f43',
    nome: 'Reações ao Stress Grave e Transtornos de Adaptação',
    codigo: 'F43',
    categoria: 'Transtornos Mentais',
    descricao: `Verificou-se que {{nome_paciente}} apresenta quadro compatível com Reações ao Stress Grave e Transtornos de Adaptação ({{codigo}}), surgido em resposta a evento(s) estressor(es) identificável(is). A sintomatologia inclui estado de sofrimento subjetivo, perturbação emocional com interferência no funcionamento social e laboral, podendo manifestar-se como humor deprimido, ansiedade, preocupação ou combinação desses elementos. O impacto no desempenho das atividades habituais é clinicamente relevante.`,
  },

  // ─── Doenças do Sistema Osteomuscular ───────────────────────────────────────
  {
    id: 'm54',
    nome: 'Dorsalgia',
    codigo: 'M54',
    categoria: 'Sistema Osteomuscular',
    descricao: `O(A) periciando(a) {{nome_paciente}} apresenta diagnóstico de Dorsalgia ({{codigo}}), com dor localizada na região dorsal da coluna vertebral. O exame clínico e os exames complementares evidenciam alterações estruturais compatíveis com o quadro álgico relatado. A condição impõe limitação às atividades que requerem postura estática prolongada, esforço físico com flexão e extensão do tronco, levantamento e transporte de cargas, e atividades que exacerbem a sintomatologia dolorosa.`,
  },
  {
    id: 'm51',
    nome: 'Outras Degenerações de Disco Intervertebral',
    codigo: 'M51',
    categoria: 'Sistema Osteomuscular',
    descricao: `Constatou-se que {{nome_paciente}} é portador(a) de degeneração discal intervertebral ({{codigo}}), confirmada por exames de imagem. O quadro clínico é caracterizado por dor lombar e/ou cervical crônica, com possível irradiação para membros, parestesias e limitação funcional. A condição gera incapacidade para atividades laborais que envolvam esforços físicos, manutenção de postura inadequada por períodos prolongados e movimentação repetitiva da coluna vertebral.`,
  },
  {
    id: 'm79',
    nome: 'Outras Doenças dos Tecidos Moles',
    codigo: 'M79',
    categoria: 'Sistema Osteomuscular',
    descricao: `O(A) periciando(a) {{nome_paciente}} apresenta diagnóstico de Outras Doenças dos Tecidos Moles ({{codigo}}), com comprometimento de estruturas musculoesqueléticas que gera dor e limitação funcional. O quadro é caracterizado por pontos de dor difusa, fadiga muscular e redução da amplitude de movimentos. As atividades laborais que exijam esforço físico moderado a intenso, movimentos repetitivos e manutenção de postura inadequada estão comprometidas pela condição clínica apresentada.`,
  },

  // ─── Doenças do Sistema Nervoso ──────────────────────────────────────────────
  {
    id: 'g43',
    nome: 'Enxaqueca',
    codigo: 'G43',
    categoria: 'Sistema Nervoso',
    descricao: `O(A) periciando(a) {{nome_paciente}} é portador(a) de Enxaqueca ({{codigo}}), com crises recorrentes de cefaleia intensa, geralmente unilateral, de caráter pulsátil, acompanhadas de náuseas, vômitos e/ou fotofobia e fonofobia. A frequência e a intensidade das crises, documentadas em prontuário, comprometem de forma significativa a capacidade de trabalho durante os episódios, impossibilitando a realização de atividades laborais que exijam atenção, concentração e esforço físico ou intelectual.`,
  },
  {
    id: 'g47',
    nome: 'Distúrbios do Sono',
    codigo: 'G47',
    categoria: 'Sistema Nervoso',
    descricao: `Constatou-se que {{nome_paciente}} apresenta Distúrbios do Sono ({{codigo}}), com comprometimento da qualidade e quantidade do sono que repercute diretamente na funcionalidade diurna. O quadro inclui insônia, hipersonia ou distúrbios do ciclo circadiano, resultando em sonolência diurna, fadiga, redução da concentração e do rendimento cognitivo. Tais alterações impactam negativamente o desempenho em atividades laborais que demandem atenção sustentada, vigilância e tomada de decisão.`,
  },
  {
    id: 'g54',
    nome: 'Transtornos das Raízes e Plexos Nervosos',
    codigo: 'G54',
    categoria: 'Sistema Nervoso',
    descricao: `O(A) periciando(a) {{nome_paciente}} apresenta diagnóstico de Transtornos das Raízes e Plexos Nervosos ({{codigo}}), com quadro de radiculopatia confirmado clinicamente e pelos exames complementares. Os sintomas incluem dor irradiada, parestesias, alterações de sensibilidade e possível déficit motor no território acometido. A condição gera limitação funcional para atividades laborais que envolvam esforço físico, movimentos que comprimam as estruturas nervosas e permanência em posições que exacerbem a sintomatologia.`,
  },

  // ─── Doenças Cardiovasculares ────────────────────────────────────────────────
  {
    id: 'i10',
    nome: 'Hipertensão Essencial',
    codigo: 'I10',
    categoria: 'Doenças Cardiovasculares',
    descricao: `O(A) periciando(a) {{nome_paciente}} é portador(a) de Hipertensão Arterial Essencial ({{codigo}}), com histórico documentado de elevação persistente da pressão arterial sistêmica. O controle pressórico requer tratamento farmacológico contínuo e restrição de atividades que promovam elevação abrupta da pressão arterial, como esforços físicos intensos, situações de estresse agudo e exposição a ambientes de alta exigência emocional. A condição deve ser considerada na avaliação da capacidade laboral.`,
  },
  {
    id: 'i25',
    nome: 'Doença Isquêmica Crônica do Coração',
    codigo: 'I25',
    categoria: 'Doenças Cardiovasculares',
    descricao: `Verificou-se que {{nome_paciente}} é portador(a) de Doença Isquêmica Crônica do Coração ({{codigo}}), com comprometimento da circulação coronariana documentado por exames cardiológicos. O quadro impõe restrições significativas a esforços físicos moderados e intensos, situações de estresse emocional e exposição a condições ambientais adversas. A condição clínica fundamenta limitação laboral para atividades que demandem esforço físico acima do limiar tolerável e exposição a fatores de risco cardiovascular.`,
  },

  // ─── Outras Condições ────────────────────────────────────────────────────────
  {
    id: 'z73',
    nome: 'Problemas Relacionados com a Organização do Modo de Vida',
    codigo: 'Z73',
    categoria: 'Fatores Socioeconômicos',
    descricao: `Constatou-se que {{nome_paciente}} apresenta condição enquadrada em Problemas Relacionados com a Organização do Modo de Vida ({{codigo}}), incluindo esgotamento vital (burnout), com exaustão física e mental decorrente de sobrecarga laboral prolongada. O quadro é caracterizado por fadiga extrema, sensação de esgotamento, redução da eficácia profissional e distanciamento do trabalho. A condição é clinicamente reconhecida como causa de incapacidade laboral temporária ou definitiva, dependendo da gravidade e da resposta ao tratamento.`,
  },
]

export const CATEGORIES = [...new Set(DISEASE_LIBRARY.map(d => d.categoria))]
