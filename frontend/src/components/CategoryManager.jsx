import { useState, useEffect } from 'react'
import { useTelegram } from '../contexts/TelegramContext'
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Palette, 
  Image, 
  ShoppingCart, 
  Car, 
  Gamepad2, 
  Shirt, 
  Heart, 
  Home, 
  Utensils,
  GraduationCap,
  Plane,
  Gift,
  Coffee
} from 'lucide-react'


const CategoryManager = () => {
  const { user, api } = useTelegram()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)

  // Предустановленные иконки
  const presetIcons = [
    { name: 'shopping-cart', icon: ShoppingCart, label: 'Покупки' },
    { name: 'car', icon: Car, label: 'Транспорт' },
    { name: 'gamepad-2', icon: Gamepad2, label: 'Развлечения' },
    { name: 'shirt', icon: Shirt, label: 'Одежда' },
    { name: 'heart', icon: Heart, label: 'Здоровье' },
    { name: 'home', icon: Home, label: 'Дом' },
    { name: 'utensils', icon: Utensils, label: 'Еда' },
    { name: 'graduation-cap', icon: GraduationCap, label: 'Образование' },
    { name: 'plane', icon: Plane, label: 'Путешествия' },
    { name: 'gift', icon: Gift, label: 'Подарки' },
    { name: 'coffee', icon: Coffee, label: 'Кафе' }
  ]

  // Предустановленные цвета
  const presetColors = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
    '#F97316', '#6366F1', '#14B8A6', '#F43F5E',
    '#6B7280', '#9CA3AF', '#D1D5DB', '#E5E7EB'
  ]

  useEffect(() => {
    if (user) {
      loadCategories()
    }
  }, [user])

  const loadCategories = async () => {
    try {
      const response = await api.get(`/api/users/${user.id}/categories`)
      setCategories(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error loading categories:', error)
      setLoading(false)
    }
  }

  const createCategory = async (categoryData) => {
    try {
      const response = await api.post(`/api/users/${user.id}/categories`, categoryData)
      setCategories([...categories, response.data])
      setShowForm(false)
      window.showTelegramAlert('Категория успешно создана!')
    } catch (error) {
      console.error('Error creating category:', error)
      window.showTelegramAlert('Ошибка при создании категории')
    }
  }

  const updateCategory = async (categoryId, categoryData) => {
    try {
      const response = await api.put(`/api/users/${user.id}/categories/${categoryId}`, categoryData)
      setCategories(categories.map(c => c.id === categoryId ? response.data : c))
      setEditingCategory(null)
      window.showTelegramAlert('Категория успешно обновлена!')
    } catch (error) {
      console.error('Error updating category:', error)
      window.showTelegramAlert('Ошибка при обновлении категории')
    }
  }

  const deleteCategory = async (categoryId) => {
    try {
      await api.delete(`/api/users/${user.id}/categories/${categoryId}`)
      setCategories(categories.filter(c => c.id !== categoryId))
      window.showTelegramAlert('Категория удалена!')
    } catch (error) {
      console.error('Error deleting category:', error)
      window.showTelegramAlert('Ошибка при удалении категории')
    }
  }

  if (loading) {
    return (
      <div className="category-manager">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Загрузка категорий...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="category-manager">
      <div className="section-header">
        <h2>🏷️ Управление категориями</h2>
        <button 
          className="action-button primary button-animation"
          onClick={() => {
            setShowForm(true);
          }}
        >
          <Plus size={16} />
          Новая категория
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏷️</div>
          <h3>У вас пока нет категорий</h3>
          <p>Создайте категории для лучшей организации транзакций</p>
          <div className="empty-state-actions">
            <button 
              className="action-button primary button-animation"
              onClick={() => {
                setShowForm(true);
              }}
            >
              <Plus size={16} />
              Создать первую категорию
            </button>
            <button 
              className="action-button secondary button-animation"
              onClick={async () => {
                try {
                  const response = await api.post(`/api/users/${user.id}/categories/default`);
                  if (response.data.success) {
                    window.showTelegramAlert(response.data.message);
                    loadCategories(); // Перезагружаем категории
                  }
                } catch (error) {
                  console.error('Error creating default categories:', error);
                  if (error.response?.data?.message) {
                    window.showTelegramAlert(error.response.data.message);
                  } else {
                    window.showTelegramAlert('Ошибка при создании базовых категорий');
                  }
                }
              }}
            >
              🎯 Создать базовые категории
            </button>
          </div>
        </div>
      ) : (
        <div className="categories-grid">
          {categories.map(category => (
            <div key={category.id} className="category-card">
              <div className="category-header">
                <div className="category-icon" style={{ backgroundColor: category.color }}>
                  {(() => {
                    const iconData = presetIcons.find(i => i.name === category.icon_name)
                    if (iconData) {
                      const IconComponent = iconData.icon
                      return <IconComponent size={20} color="white" />
                    }
                    return <span>{category.icon_name}</span>
                  })()}
                </div>
                <div className="category-actions">
                  <button 
                    className="icon-button button-animation"
                    onClick={() => {
                      setEditingCategory(category);
                    }}
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                    className="icon-button danger button-animation"
                    onClick={() => {
                      deleteCategory(category.id);
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="category-content">
                <h4>{category.name}</h4>
                <p className="category-description">
                  {category.description || 'Без описания'}
                </p>
                
                <div className="category-stats">
                  <div className="stat">
                    <span className="stat-label">Транзакций:</span>
                    <span className="stat-value">{category.transaction_count || 0}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Сумма:</span>
                    <span className={`stat-value ${category.total_amount >= 0 ? 'positive' : 'negative'}`}>
                      {category.total_amount?.toLocaleString('ru-RU') || 0} ₽
                    </span>
                  </div>
                </div>

                <div className="category-color-preview">
                  <span className="color-label">Цвет:</span>
                  <div 
                    className="color-swatch"
                    style={{ backgroundColor: category.color }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Форма создания/редактирования */}
      {(showForm || editingCategory) && (
        <CategoryForm
          onClose={() => {
            setShowForm(false)
            setEditingCategory(null)
          }}
          onSubmit={(data) => {
            if (editingCategory) {
              updateCategory(editingCategory.id, data)
            } else {
              createCategory(data)
            }
          }}
          title={editingCategory ? 'Редактировать категорию' : 'Создать новую категорию'}
          category={editingCategory}
          presetIcons={presetIcons}
          presetColors={presetColors}
        />
      )}
    </div>
  )
}

// Компонент формы для категорий
const CategoryForm = ({ onClose, onSubmit, title, category, presetIcons, presetColors }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    icon_name: category?.icon_name || 'shopping-cart',
    color: category?.color || '#3B82F6',
    type: category?.type || 'expense'
  })

  const [selectedIcon, setSelectedIcon] = useState(formData.icon_name)
  const [selectedColor, setSelectedColor] = useState(formData.color)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      icon_name: selectedIcon,
      color: selectedColor
    })
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="category-form">
          <div className="form-group">
            <label>Название категории</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Например: Продукты"
              required
            />
          </div>

          <div className="form-group">
            <label>Описание</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Краткое описание категории"
              rows="2"
            />
          </div>

          <div className="form-group">
            <label>Тип</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              required
            >
              <option value="expense">Расход</option>
              <option value="income">Доход</option>
              <option value="both">Универсальная</option>
            </select>
          </div>

          <div className="form-group">
            <label>Иконка</label>
            <div className="icon-selector">
              {presetIcons.map(iconData => {
                const IconComponent = iconData.icon
                return (
                  <button
                    key={iconData.name}
                    type="button"
                    className={`icon-option ${selectedIcon === iconData.name ? 'selected' : ''}`}
                    onClick={() => setSelectedIcon(iconData.name)}
                    title={iconData.label}
                  >
                    <IconComponent size={20} />
                  </button>
                )
              })}
            </div>
          </div>

          <div className="form-group">
            <label>Цвет</label>
            <div className="color-selector">
              {presetColors.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                  onClick={() => setSelectedColor(color)}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="selected-color-preview">
              <span>Выбранный цвет:</span>
              <div 
                className="color-swatch-large"
                style={{ backgroundColor: selectedColor }}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="action-button secondary" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="action-button primary">
              {category ? 'Обновить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CategoryManager
