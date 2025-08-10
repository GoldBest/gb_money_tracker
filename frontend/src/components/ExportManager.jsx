import { useState, useEffect } from 'react'
import { useTelegram } from '../contexts/TelegramContext'
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Calendar, 
  Filter,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
const ExportManager = () => {
  const { user, api } = useTelegram()
  const [transactions, setTransactions] = useState([])
  const [exportInfo, setExportInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState('csv')
  const [dateRange, setDateRange] = useState('month')
  const [includeCharts, setIncludeCharts] = useState(true)

  useEffect(() => {
    if (user) {
      loadTransactions()
      loadExportInfo()
    }
  }, [user, dateRange])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      
      let url = `/api/users/${user.id}/transactions`
      const params = new URLSearchParams()
      
      if (dateRange !== 'all') {
        params.append('period', dateRange)
      }
      params.append('limit', '10000')
      
      if (params.toString()) {
        url += '?' + params.toString()
      }
      
      const response = await api.get(url)
      setTransactions(response.data || [])
    } catch (error) {
      console.error('Error loading transactions:', error)
      setTransactions([])
      
      if (error.response?.status === 404) {
        window.showTelegramAlert('Пользователь не найден')
      } else if (error.response?.status === 500) {
        window.showTelegramAlert('Ошибка сервера при загрузке данных')
      } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        window.showTelegramAlert('Ошибка сети. Проверьте подключение к интернету.')
      } else {
        window.showTelegramAlert('Ошибка при загрузке транзакций')
      }
    } finally {
      setLoading(false)
    }
  }

  const loadExportInfo = async () => {
    try {
      const response = await api.get(`/api/users/${user.id}/export-info?period=${dateRange}`)
      setExportInfo(response.data)
    } catch (error) {
      console.error('Error loading export info:', error)
      setExportInfo(null)
      
      if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        console.warn('Network error when loading export info')
      }
    }
  }

  const exportToCSV = async () => {
    try {
      if (transactions.length === 0) {
        window.showTelegramAlert('Нет данных для экспорта')
        return
      }
      
      setExporting(true)
      
      const headers = ['Дата', 'Тип', 'Сумма', 'Категория', 'Описание', 'Создано']
      const csvContent = [
        headers.join(','),
        ...transactions.map(t => [
          new Date(t.created_at).toLocaleDateString('ru-RU'),
          t.type === 'income' ? 'Доход' : 'Расход',
          t.amount,
          t.category_name || 'Без категории',
          t.description || '',
          new Date(t.created_at).toLocaleString('ru-RU')
        ].join(','))
      ].join('\n')

      downloadFile(csvContent, `transactions_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv')
      
      window.showTelegramAlert('Данные успешно экспортированы в CSV!')
    } catch (error) {
      console.error('Error exporting to CSV:', error)
      window.showTelegramAlert('Ошибка при экспорте в CSV')
    } finally {
      setExporting(false)
    }
  }

  const exportToJSON = async () => {
    try {
      if (transactions.length === 0) {
        window.showTelegramAlert('Нет данных для экспорта')
        return
      }
      
      setExporting(true)
      
      const exportData = {
        export_date: new Date().toISOString(),
        period: dateRange,
        total_transactions: transactions.length,
        total_income: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
        total_expense: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
        transactions: transactions.map(t => ({
          id: t.id,
          type: t.type,
          amount: t.amount,
          category_name: t.category_name,
          description: t.description,
          created_at: t.created_at
        }))
      }

      const jsonContent = JSON.stringify(exportData, null, 2)
      downloadFile(jsonContent, `transactions_${dateRange}_${new Date().toISOString().split('T')[0]}.json`, 'application/json')
      
      window.showTelegramAlert('Данные успешно экспортированы в JSON!')
    } catch (error) {
      console.error('Error exporting to JSON:', error)
      window.showTelegramAlert('Ошибка при экспорте в JSON')
    } finally {
      setExporting(false)
    }
  }

  const exportToPDF = async () => {
    try {
      if (transactions.length === 0) {
        window.showTelegramAlert('Нет данных для экспорта')
        return
      }
      
      setExporting(true)
      
      // Создаем HTML для PDF
      const pdfContent = generatePDFHTML()
      
      // Пытаемся использовать html2pdf, если доступен
      try {
        const html2pdf = await import('html2pdf.js')
        
        const opt = {
          margin: 1,
          filename: `financial_report_${dateRange}_${new Date().toISOString().split('T')[0]}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }

        const element = document.createElement('div')
        element.innerHTML = pdfContent
        element.style.position = 'absolute'
        element.style.left = '-9999px'
        document.body.appendChild(element)

        await html2pdf.default().from(element).set(opt).save()
        
        document.body.removeChild(element)
        
        window.showTelegramAlert('PDF отчет успешно создан!')
      } catch (html2pdfError) {
        console.warn('html2pdf недоступен, используем fallback:', html2pdfError)
        
        // Fallback: создаем HTML файл для скачивания
        const htmlBlob = new Blob([pdfContent], { type: 'text/html' })
        const url = URL.createObjectURL(htmlBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `financial_report_${dateRange}_${new Date().toISOString().split('T')[0]}.html`
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        
        window.showTelegramAlert('HTML отчет создан! (PDF недоступен в этой среде)')
      }
      
    } catch (error) {
      console.error('Error exporting to PDF:', error)
      window.showTelegramAlert('Ошибка при создании отчета')
    } finally {
      setExporting(false)
    }
  }

  const generatePDFHTML = () => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    const balance = totalIncome - totalExpense

    const categoryStats = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const category = t.category_name || 'Без категории'
        acc[category] = (acc[category] || 0) + t.amount
        return acc
      }, {})

    const topCategories = Object.entries(categoryStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Финансовый отчет</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .summary { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .summary-item { text-align: center; flex: 1; }
            .summary-value { font-size: 24px; font-weight: bold; margin: 10px 0; }
            .positive { color: #10B981; }
            .negative { color: #EF4444; }
            .transactions { margin-bottom: 30px; }
            .transaction { border-bottom: 1px solid #eee; padding: 10px 0; }
            .transaction-header { display: flex; justify-content: space-between; font-weight: bold; }
            .categories { margin-bottom: 30px; }
            .category-item { display: flex; justify-content: space-between; padding: 5px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>💰 Финансовый отчет</h1>
            <p>Период: ${getPeriodLabel(dateRange)} | Дата: ${new Date().toLocaleDateString('ru-RU')}</p>
          </div>

          <div class="summary">
            <div class="summary-item">
              <div>Общий доход</div>
              <div class="summary-value positive">+${totalIncome.toLocaleString('ru-RU')} ₽</div>
            </div>
            <div class="summary-item">
              <div>Общий расход</div>
              <div class="summary-value negative">-${totalExpense.toLocaleString('ru-RU')} ₽</div>
            </div>
            <div class="summary-item">
              <div>Баланс</div>
              <div class="summary-value ${balance >= 0 ? 'positive' : 'negative'}">
                ${balance >= 0 ? '+' : ''}${balance.toLocaleString('ru-RU')} ₽
              </div>
            </div>
          </div>

          <div class="categories">
            <h3>Топ категорий расходов</h3>
            ${topCategories.map(([category, amount]) => `
              <div class="category-item">
                <span>${category}</span>
                <span>${amount.toLocaleString('ru-RU')} ₽</span>
              </div>
            `).join('')}
          </div>

          <div class="transactions">
            <h3>Последние транзакции (${Math.min(transactions.length, 20)})</h3>
            ${transactions.slice(0, 20).map(t => `
              <div class="transaction">
                <div class="transaction-header">
                  <span>${new Date(t.created_at).toLocaleDateString('ru-RU')}</span>
                  <span class="${t.type === 'income' ? 'positive' : 'negative'}">
                    ${t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
                <div>${t.category_name || 'Без категории'} - ${t.description || 'Без описания'}</div>
              </div>
            `).join('')}
          </div>

          <div class="footer">
            <p>Отчет создан в GB Money Tracker Mini App</p>
            <p>Всего транзакций: ${transactions.length}</p>
          </div>
        </body>
      </html>
    `
  }

  const downloadFile = (content, filename, mimeType) => {
    try {
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      
      // Пытаемся использовать стандартный способ скачивания
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Очищаем URL
      setTimeout(() => {
        URL.revokeObjectURL(url)
      }, 100)
      
    } catch (error) {
      console.error('Error downloading file:', error)
      
      // Fallback: показываем содержимое в новом окне
      const newWindow = window.open('', '_blank')
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>${filename}</title>
              <meta charset="utf-8">
            </head>
            <body>
              <pre style="white-space: pre-wrap; font-family: monospace; padding: 20px;">
                ${content}
              </pre>
              <p>Скопируйте содержимое и сохраните в файл ${filename}</p>
            </body>
          </html>
        `)
        newWindow.document.close()
      } else {
        window.showTelegramAlert(`Ошибка скачивания. Содержимое файла ${filename} скопировано в буфер обмена.`)
        // Пытаемся скопировать в буфер обмена
        if (navigator.clipboard) {
          navigator.clipboard.writeText(content)
        }
      }
    }
  }

  const getPeriodLabel = (period) => {
    const labels = {
      week: 'Неделя',
      month: 'Месяц',
      quarter: 'Квартал',
      year: 'Год',
      all: 'Все время'
    }
    return labels[period] || period
  }

  const handleExport = () => {
    switch (exportFormat) {
      case 'csv':
        exportToCSV()
        break
      case 'json':
        exportToJSON()
        break
      case 'pdf':
        exportToPDF()
        break
      default:
        exportToCSV()
    }
  }

  const getExportIcon = () => {
    switch (exportFormat) {
      case 'csv':
        return <FileSpreadsheet size={16} />
      case 'json':
        return <FileText size={16} />
      case 'pdf':
        return <FileText size={16} />
      default:
        return <Download size={16} />
    }
  }

  const getExportLabel = () => {
    switch (exportFormat) {
      case 'csv':
        return 'Экспорт CSV'
      case 'json':
        return 'Экспорт JSON'
      case 'pdf':
        return 'Создать PDF'
      default:
        return 'Экспорт'
    }
  }

  return (
    <div className="export-manager">
      <div className="section-header">
        <h2>📊 Экспорт данных</h2>
        <p>Выгрузите ваши финансовые данные в различных форматах</p>
      </div>

      <div className="export-controls">
        <div className="control-group">
          <label>Формат экспорта</label>
          <div className="format-selector">
            <button
              className={`format-button ${exportFormat === 'csv' ? 'active' : ''}`}
              onClick={() => setExportFormat('csv')}
            >
              <FileSpreadsheet size={16} />
              CSV
            </button>
            <button
              className={`format-button ${exportFormat === 'json' ? 'active' : ''}`}
              onClick={() => setExportFormat('json')}
            >
              <FileText size={16} />
              JSON
            </button>
            <button
              className={`format-button ${exportFormat === 'pdf' ? 'active' : ''}`}
              onClick={() => setExportFormat('pdf')}
            >
              <FileText size={16} />
              PDF
            </button>
          </div>
        </div>

        <div className="control-group">
          <label>Период данных</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="period-select"
          >
            <option value="week">Неделя</option>
            <option value="month">Месяц</option>
            <option value="quarter">Квартал</option>
            <option value="year">Год</option>
            <option value="all">Все время</option>
          </select>
        </div>

        {exportFormat === 'pdf' && (
          <div className="control-group">
            <label>
              <input
                type="checkbox"
                checked={includeCharts}
                onChange={(e) => setIncludeCharts(e.target.checked)}
              />
              Включить графики и диаграммы
            </label>
          </div>
        )}
      </div>

      <div className="export-summary">
        <h3>Сводка по выбранному периоду</h3>
        {loading || !exportInfo ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Загрузка данных...</p>
          </div>
        ) : (
          <div className="summary-stats">
            <div className="summary-card">
              <div className="summary-icon positive">
                <TrendingUp size={20} />
              </div>
              <div className="summary-content">
                <div className="summary-label">Транзакций</div>
                <div className="summary-value">{exportInfo?.total_transactions || transactions.length}</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon positive">
                <TrendingUp size={20} />
              </div>
              <div className="summary-content">
                <div className="summary-label">Доходы</div>
                <div className="summary-value positive">
                  +{(exportInfo?.total_income || transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)).toLocaleString('ru-RU')} ₽
                </div>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon negative">
                <TrendingDown size={20} />
              </div>
              <div className="summary-content">
                <div className="summary-label">Расходы</div>
                <div className="summary-value negative">
                  -{(exportInfo?.total_expense || transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)).toLocaleString('ru-RU')} ₽
                </div>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">
                <span style={{ fontSize: '20px', fontWeight: 'bold' }}>₽</span>
              </div>
              <div className="summary-content">
                <div className="summary-label">Баланс</div>
                <div className={`summary-value ${(exportInfo?.balance || transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) - transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)) >= 0 ? 'positive' : 'negative'}`}>
                  {(exportInfo?.balance || transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) - transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)) >= 0 ? '+' : ''}
                  {(exportInfo?.balance || transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) - transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)).toLocaleString('ru-RU')} ₽
                </div>
              </div>
            </div>
            
            {!exportInfo && transactions.length > 0 && (
              <div className="summary-note">
                <p>⚠️ Отображаются данные из локального кэша (API недоступен)</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="export-actions">
        <button
          className="action-button primary button-animation"
          onClick={handleExport}
          disabled={exporting || (!exportInfo || exportInfo.total_transactions === 0)}
        >
          {getExportIcon()}
          {exporting ? 'Экспорт...' : getExportLabel()}
        </button>

        <div className="export-info">
          <p>
            <strong>Формат:</strong> {exportFormat.toUpperCase()}
          </p>
          <p>
            <strong>Период:</strong> {getPeriodLabel(dateRange)}
          </p>
          <p>
            <strong>Транзакций:</strong> {exportInfo?.total_transactions || transactions.length}
          </p>
          {exportInfo?.date_from && exportInfo?.date_to && (
            <p>
              <strong>Период:</strong> {new Date(exportInfo.date_from).toLocaleDateString('ru-RU')} - {new Date(exportInfo.date_to).toLocaleDateString('ru-RU')}
            </p>
          )}
        </div>
      </div>

      {(!exportInfo || exportInfo.total_transactions === 0) && (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>Нет данных для экспорта</h3>
          <p>Добавьте транзакции, чтобы экспортировать данные</p>
        </div>
      )}
    </div>
  )
}

export default ExportManager

