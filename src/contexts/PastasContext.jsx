import { createContext, useContext, useState } from 'react'

const PastasContext = createContext()

const CLIENTES_INICIAIS = [
  {
    id: 'cli-001',
    nome: 'Gabriel',
    arquivos: [
      {
        id: 'arq-g1',
        nome: 'Laudo_Pericial_Gabriel.pdf',
        tipo: 'pdf',
        tamanho: '245 KB',
        dataUpload: '2024-01-15',
        url: '/mock/laudo-gabriel.pdf',
        favorito: false,
      },
      {
        id: 'arq-g2',
        nome: 'Exame_Raio_X.jpg',
        tipo: 'imagem',
        tamanho: '2.8 MB',
        dataUpload: '2024-01-20',
        url: 'https://picsum.photos/seed/gabriel1/400/300',
        favorito: true,
      },
      {
        id: 'arq-g3',
        nome: 'Documento_Identidade.docx',
        tipo: 'docx',
        tamanho: '156 KB',
        dataUpload: '2024-01-10',
        url: '/mock/doc-gabriel.docx',
        favorito: false,
      },
    ],
  },
  {
    id: 'cli-002',
    nome: 'Maria Silva',
    arquivos: [
      {
        id: 'arq-m1',
        nome: 'Laudo_Final_Maria.pdf',
        tipo: 'pdf',
        tamanho: '312 KB',
        dataUpload: '2024-01-18',
        url: '/mock/laudo-maria.pdf',
        favorito: false,
      },
      {
        id: 'arq-m2',
        nome: 'Eletrocardiograma.jpg',
        tipo: 'imagem',
        tamanho: '1.5 MB',
        dataUpload: '2024-01-21',
        url: 'https://picsum.photos/seed/maria1/400/300',
        favorito: true,
      },
      {
        id: 'arq-m3',
        nome: 'Anamnese_Completa.pdf',
        tipo: 'pdf',
        tamanho: '156 KB',
        dataUpload: '2024-01-05',
        url: '/mock/anamnese-maria.pdf',
        favorito: false,
      },
      {
        id: 'arq-m4',
        nome: 'Atestado_Medico.docx',
        tipo: 'docx',
        tamanho: '32 KB',
        dataUpload: '2024-01-12',
        url: '/mock/atestado-maria.docx',
        favorito: false,
      },
      {
        id: 'arq-m5',
        nome: 'CT_Abdomen.jpg',
        tipo: 'imagem',
        tamanho: '4.2 MB',
        dataUpload: '2024-01-23',
        url: 'https://picsum.photos/seed/maria2/400/300',
        favorito: false,
      },
    ],
  },
]

export function PastasProvider({ children }) {
  const [clientes, setClientes] = useState(CLIENTES_INICIAIS)
  const [clienteAtivo, setClienteAtivo] = useState(null)

  const criarPasta = (nome) => {
    const novoCliente = {
      id: `cli-${Date.now()}`,
      nome,
      arquivos: [],
      subpastas: [],
    }
    setClientes((prev) => [...prev, novoCliente])
    return novoCliente
  }

  const criarSubpasta = (clienteId, nome, cor) => {
    const novaSubpasta = {
      id: `sub-${Date.now()}`,
      nome,
      arquivos: [],
      cor: cor || '#EAB308',
    }
    setClientes((prev) => {
      const updated = prev.map((c) => {
        if (c.id === clienteId) {
          return {
            ...c,
            subpastas: [...(c.subpastas || []), novaSubpasta],
          }
        }
        return c
      })
      if (clienteAtivo?.id === clienteId) {
        const clienteAtualizado = updated.find(c => c.id === clienteId)
        if (clienteAtualizado) setClienteAtivo(clienteAtualizado)
      }
      return updated
    })
    return novaSubpasta
  }

  const excluirPasta = (id) => {
    setClientes((prev) => prev.filter((c) => c.id !== id))
    if (clienteAtivo?.id === id) {
      setClienteAtivo(null)
    }
  }

  const excluirSubpasta = (clienteId, subpastaId) => {
    setClientes((prev) => {
      const updated = prev.map((c) => {
        if (c.id === clienteId) {
          return {
            ...c,
            subpastas: c.subpastas.filter(s => s.id !== subpastaId),
          }
        }
        return c
      })
      if (clienteAtivo?.id === clienteId) {
        const clienteAtualizado = updated.find(c => c.id === clienteId)
        if (clienteAtualizado) setClienteAtivo(clienteAtualizado)
      }
      return updated
    })
  }

  const adicionarArquivo = (clienteId, arquivo, subpastaId = null) => {
    setClientes((prev) => {
      const updated = prev.map((c) => {
        if (c.id === clienteId) {
          if (subpastaId) {
            return {
              ...c,
              subpastas: c.subpastas.map(s =>
                s.id === subpastaId
                  ? { ...s, arquivos: [...s.arquivos, { ...arquivo, id: `arq-${Date.now()}` }] }
                  : s
              ),
            }
          }
          return {
            ...c,
            arquivos: [...c.arquivos, { ...arquivo, id: `arq-${Date.now()}` }],
          }
        }
        return c
      })
      if (clienteAtivo?.id === clienteId) {
        const clienteAtualizado = updated.find(c => c.id === clienteId)
        if (clienteAtualizado) setClienteAtivo(clienteAtualizado)
      }
      return updated
    })
  }

  const excluirArquivo = (clienteId, arquivoId, subpastaId = null) => {
    setClientes((prev) => {
      const updated = prev.map((c) => {
        if (c.id === clienteId) {
          if (subpastaId) {
            return {
              ...c,
              subpastas: c.subpastas.map(s =>
                s.id === subpastaId
                  ? { ...s, arquivos: s.arquivos.filter(a => a.id !== arquivoId) }
                  : s
              ),
            }
          }
          return {
            ...c,
            arquivos: c.arquivos.filter((a) => a.id !== arquivoId),
          }
        }
        return c
      })
      if (clienteAtivo?.id === clienteId) {
        const clienteAtualizado = updated.find(c => c.id === clienteId)
        if (clienteAtualizado) setClienteAtivo(clienteAtualizado)
      }
      return updated
    })
  }

  const moverArquivos = (clienteId, arquivoIds, destinoSubpastaId, origemSubpastaId = null) => {
    setClientes((prev) => {
      const updated = prev.map((c) => {
        if (c.id === clienteId) {
          let arquivosParaMover = []
          let newArquivos = [...c.arquivos]
          let newSubpastas = c.subpastas ? [...c.subpastas] : []

          if (origemSubpastaId) {
            const subpastaOrigem = newSubpastas.find(s => s.id === origemSubpastaId)
            if (subpastaOrigem) {
              arquivosParaMover = subpastaOrigem.arquivos.filter(a => arquivoIds.includes(a.id))
              const subpastaAtualizada = {
                ...subpastaOrigem,
                arquivos: subpastaOrigem.arquivos.filter(a => !arquivoIds.includes(a.id))
              }
              newSubpastas = newSubpastas.map(s => s.id === origemSubpastaId ? subpastaAtualizada : s)
            }
          } else {
            arquivosParaMover = c.arquivos.filter(a => arquivoIds.includes(a.id))
            newArquivos = c.arquivos.filter(a => !arquivoIds.includes(a.id))
          }

          if (destinoSubpastaId === 'root') {
            newArquivos = [...newArquivos, ...arquivosParaMover]
          } else {
            newSubpastas = newSubpastas.map(s => {
              if (s.id === destinoSubpastaId) {
                return { ...s, arquivos: [...s.arquivos, ...arquivosParaMover] }
              }
              return s
            })
          }

          return {
            ...c,
            arquivos: newArquivos,
            subpastas: newSubpastas,
          }
        }
        return c
      })
      if (clienteAtivo?.id === clienteId) {
        const clienteAtualizado = updated.find(c => c.id === clienteId)
        if (clienteAtualizado) setClienteAtivo(clienteAtualizado)
      }
      return updated
    })
  }

  const favoritarArquivos = (clienteId, arquivoIds, favorito) => {
    setClientes((prev) => {
      const updated = prev.map((c) => {
        if (c.id === clienteId) {
          return {
            ...c,
            arquivos: c.arquivos.map(a =>
              arquivoIds.includes(a.id) ? { ...a, favorito } : a
            ),
          }
        }
        return c
      })
      if (clienteAtivo?.id === clienteId) {
        const clienteAtualizado = updated.find(c => c.id === clienteId)
        if (clienteAtualizado) setClienteAtivo(clienteAtualizado)
      }
      return updated
    })
  }

  const atualizarArquivo = (clienteId, arquivoId, updates) => {
    setClientes((prev) => {
      const updated = prev.map((c) => {
        if (c.id === clienteId) {
          return {
            ...c,
            arquivos: c.arquivos.map((a) =>
              a.id === arquivoId ? { ...a, ...updates } : a
            ),
          }
        }
        return c
      })
      if (clienteAtivo?.id === clienteId) {
        const clienteAtualizado = updated.find(c => c.id === clienteId)
        if (clienteAtualizado) {
          setClienteAtivo(clienteAtualizado)
        }
      }
      return updated
    })
  }

  const selecionarCliente = (cliente) => {
    setClienteAtivo({ ...cliente, subpastas: cliente.subpastas || [] })
  }

  return (
    <PastasContext.Provider
      value={{
        clientes,
        clienteAtivo,
        selecionarCliente,
        criarPasta,
        criarSubpasta,
        excluirPasta,
        excluirSubpasta,
        adicionarArquivo,
        excluirArquivo,
        atualizarArquivo,
        moverArquivos,
        favoritarArquivos,
      }}
    >
      {children}
    </PastasContext.Provider>
  )
}

export function usePastas() {
  const context = useContext(PastasContext)
  if (!context) {
    throw new Error('usePastas must be used within PastasProvider')
  }
  return context
}
