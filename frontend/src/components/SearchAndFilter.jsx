import { useState, useEffect } from 'react'
import { Search, Filter, X, Calendar, Tag } from 'lucide-react'
import { hapticFeedback } from '../utils/haptic'

const SearchAndFilter = ({ onSearch, onFilter, categories = [] }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: ''
  })

  useEffect(() => {
    if (searchQuery) {
      onSearch(searchQuery)
    }
  }, [searchQuery, onSearch])

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value }
    setFilters(newFilters)
    onFilter(newFilters)
    hapticFeedback.light()
  }

  const clearFilters = () => {
    setFilters({
      type: '',
      category: '',
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: ''
    })
    onFilter({})
    hapticFeedback.medium()
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  return (
    <div className="search-filter-container">
      {/* Поиск */}
      <div className="search-box">
        <Search size={20} className="search-icon" />
        <input
          type="text"
          placeholder="Поиск по описанию..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        {searchQuery && (
          <button
            className="clear-search haptic-trigger"
            onClick={() => {
              setSearchQuery('')
              hapticFeedback.light()
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Кнопка фильтров */}
      <button
        className={`filter-toggle haptic-trigger ${showFilters ? 'active' : ''}`}
        onClick={() => {
          setShowFilters(!showFilters)
          hapticFeedback.light()
        }}
      >
        <Filter size={20} />
        {hasActiveFilters && <span className="filter-badge" />}
      </button>

      {/* Панель фильтров */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-header">
            <h4>Фильтры</h4>
            {hasActiveFilters && (
              <button
                className="clear-filters haptic-trigger"
                onClick={clearFilters}
              >
                Очистить
              </button>
            )}
          </div>

          <div className="filters-grid">
            {/* Тип транзакции */}
            <div className="filter-group">
              <label>Тип</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="">Все</option>
                <option value="income">Доходы</option>
                <option value="expense">Расходы</option>
              </select>
            </div>

            {/* Категория */}
            <div className="filter-group">
              <label>Категория</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">Все</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Дата от */}
            <div className="filter-group">
              <label>Дата от</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>

            {/* Дата до */}
            <div className="filter-group">
              <label>Дата до</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>

            {/* Сумма от */}
            <div className="filter-group">
              <label>Сумма от</label>
              <input
                type="number"
                placeholder="0"
                value={filters.amountMin}
                onChange={(e) => handleFilterChange('amountMin', e.target.value)}
              />
            </div>

            {/* Сумма до */}
            <div className="filter-group">
              <label>Сумма до</label>
              <input
                type="number"
                placeholder="∞"
                value={filters.amountMax}
                onChange={(e) => handleFilterChange('amountMax', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchAndFilter
