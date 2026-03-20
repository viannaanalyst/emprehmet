import { createContext, useContext, useState } from 'react'
import { read, write, KEYS } from '../utils/storage'
import { DISEASE_LIBRARY } from '../constants/diseaseLibrary'
import { v4 as uuidv4 } from 'uuid'

const DiseaseContext = createContext(null)

export function DiseaseProvider({ children }) {
  const [diseases, setDiseases] = useState(() => {
    const stored = read(KEYS.DISEASE_LIB)
    if (stored && stored.length > 0) return stored
    write(KEYS.DISEASE_LIB, DISEASE_LIBRARY)
    return DISEASE_LIBRARY
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todas')

  function persist(updated) {
    setDiseases(updated)
    write(KEYS.DISEASE_LIB, updated)
  }

  function addDisease(data) {
    const newDisease = { id: uuidv4(), ...data }
    persist([...diseases, newDisease])
    return newDisease
  }

  function updateDisease(id, data) {
    persist(diseases.map(d => d.id === id ? { ...d, ...data } : d))
  }

  function deleteDisease(id) {
    persist(diseases.filter(d => d.id !== id))
  }

  const categories = ['Todas', ...new Set(diseases.map(d => d.categoria))]

  const filteredDiseases = diseases.filter(d => {
    const matchSearch =
      !searchTerm ||
      d.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCategory = selectedCategory === 'Todas' || d.categoria === selectedCategory
    return matchSearch && matchCategory
  })

  return (
    <DiseaseContext.Provider value={{
      diseases,
      filteredDiseases,
      categories,
      searchTerm,
      setSearchTerm,
      selectedCategory,
      setSelectedCategory,
      addDisease,
      updateDisease,
      deleteDisease,
    }}>
      {children}
    </DiseaseContext.Provider>
  )
}

export function useDiseases() {
  const ctx = useContext(DiseaseContext)
  if (!ctx) throw new Error('useDiseases must be used within DiseaseProvider')
  return ctx
}
