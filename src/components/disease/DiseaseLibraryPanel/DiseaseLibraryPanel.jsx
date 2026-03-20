import { useDiseases } from '../../../contexts/DiseaseContext'
import DiseaseCard from '../DiseaseCard/DiseaseCard'
import { Input } from '@/components/ui/Input'
import styles from './DiseaseLibraryPanel.module.css'

export default function DiseaseLibraryPanel({ selectedDiseases, onAddDisease }) {
  const { filteredDiseases, categories, searchTerm, setSearchTerm, selectedCategory, setSelectedCategory } = useDiseases()
  const selectedIds = new Set(selectedDiseases.map(d => d.id))

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h4 className={styles.title}>Biblioteca de Condições</h4>
        <Input
          className={styles.search}
          type="text"
          placeholder="Buscar por nome ou CID..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <div className={styles.categories}>
          {categories.map(cat => (
            <button
              key={cat}
              className={`${styles.catBtn} ${selectedCategory === cat ? styles.catActive : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.list}>
        {filteredDiseases.length === 0 ? (
          <p className={styles.empty}>Nenhuma condição encontrada.</p>
        ) : (
          filteredDiseases.map(d => (
            <DiseaseCard
              key={d.id}
              disease={d}
              isAdded={selectedIds.has(d.id)}
              onAdd={onAddDisease}
            />
          ))
        )}
      </div>
    </div>
  )
}
