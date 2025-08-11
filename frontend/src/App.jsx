import { useState, useEffect } from 'react'
import { TelegramProvider } from './contexts/TelegramContext'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import ErrorBoundary from './components/ErrorBoundary'
import Dashboard from './components/Dashboard'
import TransactionForm from './components/TransactionForm'
import TransactionEditForm from './components/TransactionEditForm'
import TransactionList from './components/TransactionList'
import Statistics from './components/Statistics'
import GoalManager from './components/GoalManager'
import CategoryManager from './components/CategoryManager'
import ExportManager from './components/ExportManager'
import BackupManager from './components/BackupManager'
import BudgetAlertManager from './components/BudgetAlertManager'
import NotificationManager from './components/NotificationManager'
import DataExporter from './components/DataExporter'
import AnimatedTransition from './components/AnimatedTransition'
import AnimatedButton from './components/AnimatedButton'
import AnimatedCard from './components/AnimatedCard'
import AnimatedList from './components/AnimatedList'
import AnimatedToast from './components/AnimatedToast'

import { 
  Moon, 
  Sun, 
  Plus, 
  BarChart3, 
  List, 
  TrendingUp, 
  Target, 
  Tag, 
  Wallet, 
  Bell, 
  HardDrive, 
  Download,
  Settings
} from 'lucide-react'
import './App.css'
import './mobile.css'

function AppContent() {
  const { isDark, toggleTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [activeSubTab, setActiveSubTab] = useState(null)
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [toasts, setToasts] = useState([])

  const tabs = [
    { id: 'dashboard', label: 'Главная', icon: <BarChart3 size={20} /> },
    { id: 'transactions', label: 'Транзакции', icon: <List size={20} /> },
    { id: 'statistics', label: 'Статистика', icon: <TrendingUp size={20} /> },
    { id: 'settings', label: 'Настройки', icon: <Settings size={20} /> }
  ]

  const settingsSubTabs = [
    { id: 'goals', label: 'Цели', icon: <Target size={20} /> },
    { id: 'categories', label: 'Категории', icon: <Tag size={20} /> },
    { id: 'budgets', label: 'Бюджеты', icon: <Wallet size={20} /> },
    { id: 'notifications', label: 'Уведомления', icon: <Bell size={20} /> },
    { id: 'backup', label: 'Резервные копии', icon: <HardDrive size={20} /> },
    { id: 'export', label: 'Экспорт', icon: <Download size={20} /> }
  ]

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Ctrl/Cmd + N - новая транзакция
      if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault()
        setShowTransactionForm(true)
      }
      
      // Ctrl/Cmd + 1-4 - переключение основных табов
      if ((event.ctrlKey || event.metaKey) && event.key >= '1' && event.key <= '4') {
        event.preventDefault()
        const tabIndex = parseInt(event.key) - 1
        if (tabs[tabIndex]) {
          setActiveTab(tabs[tabIndex].id)
        }
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [])

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction)
    setShowTransactionForm(false)
  }

  const handleTransactionSuccess = () => {
    setShowTransactionForm(false)
    setEditingTransaction(null)
    showToast('Транзакция сохранена успешно!', 'success')
  }

  const showToast = (message, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => removeToast(id), 3000)
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    setActiveSubTab(null)
  }

  const handleSubTabChange = (subTabId) => {
    setActiveSubTab(subTabId)
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onAddTransaction={() => setShowTransactionForm(true)} />
      
      case 'transactions':
        return (
          <div>
            <div className="list-header">
              <h2>Транзакции</h2>
              <button 
                className="action-button primary"
                onClick={() => setShowTransactionForm(true)}
              >
                <Plus size={18} />
                Добавить
              </button>
            </div>
            <TransactionList onEditTransaction={handleEditTransaction} />
          </div>
        )
      
      case 'statistics':
        return <Statistics />
      
      case 'settings':
        return (
          <SettingsMenu 
            subTabs={settingsSubTabs} 
            onSubTabChange={handleSubTabChange} 
            activeSubTab={activeSubTab} 
          />
        )
      
      default:
        return <Dashboard onAddTransaction={() => setShowTransactionForm(true)} />
    }
  }

  const renderSubContent = () => {
    if (!activeSubTab) return null

    switch (activeSubTab) {
      case 'goals':
        return <GoalManager />
      case 'categories':
        return <CategoryManager />
      case 'budgets':
        return <BudgetAlertManager />
      case 'notifications':
        return <NotificationManager />
      case 'backup':
        return <BackupManager />
      case 'export':
        return <ExportManager />
      default:
        return null
    }
  }

  return (
    <div className={`app ${isDark ? 'dark' : ''}`}>
      <header className="app-header">
        <h1>GB Money Tracker</h1>
        <button className="theme-toggle" onClick={toggleTheme}>
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      <main className="app-main">
        <AnimatedTransition>
          {activeSubTab ? (
            <div>
              <button 
                className="back-button"
                onClick={() => setActiveSubTab(null)}
              >
                ← Назад
              </button>
              {renderSubContent()}
            </div>
          ) : (
            renderContent()
          )}
        </AnimatedTransition>
      </main>

      <nav className="app-nav">
        <div className="nav-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              <div className="nav-icon">{tab.icon}</div>
              <div className="nav-label">{tab.label}</div>
            </button>
          ))}
        </div>
      </nav>

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <div className="modal-overlay" onClick={() => setShowTransactionForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTransaction ? 'Редактировать транзакцию' : 'Новая транзакция'}</h2>
              <button className="close-button" onClick={() => setShowTransactionForm(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              {editingTransaction ? (
                <TransactionEditForm
                  transaction={editingTransaction}
                  onSuccess={handleTransactionSuccess}
                  onCancel={() => setShowTransactionForm(false)}
                />
              ) : (
                <TransactionForm
                  onSuccess={handleTransactionSuccess}
                  onCancel={() => setShowTransactionForm(false)}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <AnimatedToast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  )
}

function SettingsMenu({ subTabs, onSubTabChange, activeSubTab }) {
  return (
    <div className="settings-menu">
      <div className="settings-header">
        <h2>Настройки</h2>
        <p>Управление приложением и данными</p>
      </div>
      
      <div className="settings-grid">
        {subTabs.map(subTab => (
          <button
            key={subTab.id}
            className={`settings-item ${activeSubTab === subTab.id ? 'active' : ''}`}
            onClick={() => onSubTabChange(subTab.id)}
          >
            <div className="settings-icon">{subTab.icon}</div>
            <div className="settings-content">
              <h3>{subTab.label}</h3>
              <p>{getSettingsDescription(subTab.id)}</p>
            </div>
            <div className="settings-arrow">→</div>
          </button>
        ))}
      </div>
    </div>
  )
}

function getSettingsDescription(subTabId) {
  const descriptions = {
    goals: 'Установите финансовые цели и отслеживайте прогресс',
    categories: 'Настройте категории доходов и расходов',
    budgets: 'Установите лимиты по категориям',
    notifications: 'Настройте уведомления и напоминания',
    backup: 'Создавайте резервные копии данных',
    export: 'Экспортируйте данные в различных форматах'
  }
  return descriptions[subTabId] || ''
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <TelegramProvider>
          <AppContent />
        </TelegramProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
