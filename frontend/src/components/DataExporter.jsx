import { useState, useEffect } from 'react'
import { useTelegram } from '../contexts/TelegramContext'
import { Download, FileText, FileSpreadsheet, Calendar, Filter, X } from 'lucide-react'
import { hapticFeedback } from '../utils/haptic'

const DataExporter = () => {
  const { user, api } = useTelegram()
  const [exporting, setExporting] = useState(false)
  const [exportOptions, setExportOptions] = useState({
    format: 'excel',
    dateFrom: '',
    dateTo: '',
    includeCategories: true,
    includeTransactions: true,
    includeGoals: false,
    includeStats: true
  })
  const [showFilters, setShowFilters] = useState(false)

  const handleExport = async () => {
    if (!user) return

    try {
      setExporting(true)
      hapticFeedback.medium()

      // Собираем параметры экспорта
      const params = new URLSearchParams({
        user_id: user.id,
        format: exportOptions.format,
        include_categories: exportOptions.includeCategories,
        include_transactions: exportOptions.includeTransactions,
        include_goals: exportOptions.includeGoals,
        include_stats: exportOptions.includeStats
      })

      if (exportOptions.dateFrom) {
        params.append('date_from', exportOptions.dateFrom)
      }
      if (exportOptions.dateTo) {
        params.append('date_to', exportOptions.dateTo)
      }

      // Выполняем экспорт
      const response = await api.get(`/api/export?${params.toString()}`, {
        responseType: 'blob'
      })

      // Создаем ссылку для скачивания
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      
      const timestamp = new Date().toISOString().split('T')[0]
              const filename = `gb_money_tracker_${timestamp}.${exportOptions.format === 'excel' ? 'xlsx' : 'csv'}`
      
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      hapticFeedback.success()
      window.showTelegramAlert('Экспорт завершен успешно!')
    } catch (error) {
      console.error('Export error:', error)
      hapticFeedback.error()
      window.showTelegramAlert('Ошибка при экспорте данных')
    } finally {
      setExporting(false)
    }
  }

  const handleOptionChange = (option, value) => {
    setExportOptions(prev => ({ ...prev, [option]: value }))
    hapticFeedback.light()
  }

  const resetOptions = () => {
    setExportOptions({
      format: 'excel',
      dateFrom: '',
      dateTo: '',
      includeCategories: true,
      includeTransactions: true,
      includeGoals: false,
      includeStats: true
    })
    hapticFeedback.medium()
  }

  const getFormatIcon = (format) => {
    return format === 'excel' ? <FileSpreadsheet size={20} /> : <FileText size={20} />
  }

  const getFormatLabel = (format) => {
    return format === 'excel' ? 'Excel (.xlsx)' : 'CSV (.csv)'
  }

  return (
    <div className="data-exporter">
      <div className="exporter-header">
        <h3>Экспорт данных</h3>
        <p>Выгрузите ваши финансовые данные для анализа или резервного копирования</p>
      </div>

      <div className="export-options">
        {/* Формат экспорта */}
        <div className="option-group">
          <label>Формат файла</label>
          <div className="format-selector">
            {['excel', 'csv'].map(format => (
              <button
                key={format}
                className={`format-option haptic-trigger ${exportOptions.format === format ? 'active' : ''}`}
                onClick={() => handleOptionChange('format', format)}
              >
                {getFormatIcon(format)}
                <span>{getFormatLabel(format)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Период экспорта */}
        <div className="option-group">
          <label>Период экспорта</label>
          <div className="date-range">
            <div className="date-input">
              <Calendar size={16} />
              <input
                type="date"
                value={exportOptions.dateFrom}
                onChange={(e) => handleOptionChange('dateFrom', e.target.value)}
                placeholder="От"
              />
            </div>
            <span className="date-separator">—</span>
            <div className="date-input">
              <Calendar size={16} />
              <input
                type="date"
                value={exportOptions.dateTo}
                onChange={(e) => handleOptionChange('dateTo', e.target.value)}
                placeholder="До"
              />
            </div>
          </div>
          <small>Оставьте пустым для экспорта всех данных</small>
        </div>

        {/* Что включать */}
        <div className="option-group">
          <label>Что включить в экспорт</label>
          <div className="include-options">
            <label className="checkbox-option">
              <input
                type="checkbox"
                checked={exportOptions.includeTransactions}
                onChange={(e) => handleOptionChange('includeTransactions', e.target.checked)}
              />
              <span>Транзакции</span>
            </label>
            
            <label className="checkbox-option">
              <input
                type="checkbox"
                checked={exportOptions.includeCategories}
                onChange={(e) => handleOptionChange('includeCategories', e.target.checked)}
              />
              <span>Категории</span>
            </label>
            
            <label className="checkbox-option">
              <input
                type="checkbox"
                checked={exportOptions.includeGoals}
                onChange={(e) => handleOptionChange('includeGoals', e.target.checked)}
              />
              <span>Цели</span>
            </label>
            
            <label className="checkbox-option">
              <input
                type="checkbox"
                checked={exportOptions.includeStats}
                onChange={(e) => handleOptionChange('includeStats', e.target.checked)}
              />
              <span>Статистика</span>
            </label>
          </div>
        </div>

        {/* Быстрые периоды */}
        <div className="option-group">
          <label>Быстрые периоды</label>
          <div className="quick-periods">
            {[
              { label: 'Текущий месяц', days: 30 },
              { label: 'Последние 3 месяца', days: 90 },
              { label: 'Последние 6 месяцев', days: 180 },
              { label: 'Текущий год', days: 365 }
            ].map(period => {
              const dateFrom = new Date()
              dateFrom.setDate(dateFrom.getDate() - period.days)
              return (
                <button
                  key={period.days}
                  className="period-button haptic-trigger"
                  onClick={() => {
                    handleOptionChange('dateFrom', dateFrom.toISOString().split('T')[0])
                    handleOptionChange('dateTo', new Date().toISOString().split('T')[0])
                  }}
                >
                  {period.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Действия */}
      <div className="exporter-actions">
        <button
          className="action-button secondary haptic-trigger"
          onClick={resetOptions}
        >
          Сбросить
        </button>
        
        <button
          className="action-button primary haptic-trigger"
          onClick={handleExport}
          disabled={exporting || (!exportOptions.includeTransactions && !exportOptions.includeCategories && !exportOptions.includeGoals && !exportOptions.includeStats)}
        >
          {exporting ? (
            <>
              <div className="loading-spinner"></div>
              Экспорт...
            </>
          ) : (
            <>
              <Download size={20} />
              Экспортировать
            </>
          )}
        </button>
      </div>

      {/* Информация */}
      <div className="export-info">
        <h4>Что будет в файле:</h4>
        <ul>
          {exportOptions.includeTransactions && (
            <li>📊 Все транзакции с датами, суммами, категориями и описаниями</li>
          )}
          {exportOptions.includeCategories && (
            <li>🏷️ Список категорий с цветами и типами</li>
          )}
          {exportOptions.includeGoals && (
            <li>🎯 Текущие цели с прогрессом и дедлайнами</li>
          )}
          {exportOptions.includeStats && (
            <li>📈 Сводная статистика по доходам и расходам</li>
          )}
        </ul>
        
        <div className="format-info">
          <strong>{exportOptions.format === 'excel' ? 'Excel формат:' : 'CSV формат:'}</strong>
          {exportOptions.format === 'excel' ? (
            <span>Структурированные данные с несколькими листами, форматирование и формулы</span>
          ) : (
            <span>Простой текстовый формат, совместимый с любыми табличными редакторами</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default DataExporter
