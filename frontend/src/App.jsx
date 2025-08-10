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
import ApplePageTransition, { 
  AppleTabTransition, 
  AppleStaggeredList, 
  AppleFadeIn, 
  AppleAnimatedCounter,
  useAppleAnimation 
} from './components/ApplePageTransition'
import { 
  AppleButton, 
  AppleInput, 
  AppleCard, 
  AppleStaggeredList as NewAppleStaggeredList,
  AppleAnimatedCounter as NewAppleAnimatedCounter,
  useAppleAnimation as useNewAppleAnimation 
} from './components/AppleMicroInteractions'
import { 
  AppleSkeleton,
  AppleSkeletonBalance,
  AppleSkeletonStats,
  AppleSkeletonTransactions,
  useSkeleton
} from './components/AppleSkeleton'

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
import './styles/apple-theme.css'
import './mobile.css'
import './styles/animations.css'
import './styles/apple-animations.css'
import './styles/apple-transitions.css'
import './styles/apple-micro-interactions.css'

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
      if ((event.ctrlKey || event.metaKey) && ['1', '2', '3', '4'].includes(event.key)) {
        event.preventDefault()
        const tabIndex = parseInt(event.key) - 1
        if (tabs[tabIndex]) {
          setActiveTab(tabs[tabIndex].id)
          setActiveSubTab(null)
        }
      }
      
      // Ctrl/Cmd + T - переключение темы
      if ((event.ctrlKey || event.metaKey) && event.key === 't') {
        event.preventDefault()
        toggleTheme()
      }
      
      // Escape - закрыть модальные окна
      if (event.key === 'Escape') {
        if (showTransactionForm) {
          setShowTransactionForm(false)
        }
        if (editingTransaction) {
          setEditingTransaction(null)
        }
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [showTransactionForm, editingTransaction, tabs, toggleTheme])

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction)
  }

  const handleTransactionSuccess = () => {
    setShowTransactionForm(false)
    setEditingTransaction(null)
    showToast('Транзакция успешно сохранена!', 'success')
    // Здесь можно добавить обновление данных
  }

  const showToast = (message, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => removeToast(id), 5000)
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
        return <TransactionList onEditTransaction={handleEditTransaction} />
      case 'statistics':
        return <Statistics />
      case 'settings':
        if (activeSubTab) {
          switch (activeSubTab) {
            case 'goals':
              return <GoalManager onBack={() => setActiveSubTab(null)} />
            case 'categories':
              return <CategoryManager onBack={() => setActiveSubTab(null)} />
            case 'budgets':
              return <BudgetAlertManager onBack={() => setActiveSubTab(null)} />
            case 'notifications':
              return <NotificationManager onBack={() => setActiveSubTab(null)} />
            case 'backup':
              return <BackupManager onBack={() => setActiveSubTab(null)} />
            case 'export':
              return <ExportManager onBack={() => setActiveSubTab(null)} />
            default:
              return <SettingsMenu subTabs={settingsSubTabs} onSubTabChange={handleSubTabChange} activeSubTab={activeSubTab} />
          }
        }
        return <SettingsMenu subTabs={settingsSubTabs} onSubTabChange={handleSubTabChange} activeSubTab={activeSubTab} />
      default:
        return <Dashboard onAddTransaction={() => setShowTransactionForm(true)} />
    }
  }

  return (
    <div className={`app ${isDark ? 'dark' : ''}`}>
      <header className="app-header">
        <h1>GB Money Tracker</h1>
        <button 
          className="theme-toggle" 
          onClick={toggleTheme}
          aria-label="Переключить тему"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      <nav className="app-nav">
        <div className="nav-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="app-main">
        <AppleTabTransition 
          key={activeTab + (activeSubTab || '')}
          activeTab={activeTab}
          tabId={activeTab}
          direction="right"
          duration={300}
        >
          {renderContent()}
        </AppleTabTransition>
      </main>



      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <div className="modal-overlay" onClick={() => setShowTransactionForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Новая транзакция</h2>
              <button 
                className="close-button" 
                onClick={() => setShowTransactionForm(false)}
                aria-label="Закрыть"
              >
                <Plus size={20} style={{ transform: 'rotate(45deg)' }} />
              </button>
            </div>
            <div className="modal-body">
              <TransactionForm 
                onSubmit={handleTransactionSuccess}
                onCancel={() => setShowTransactionForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <div className="modal-overlay" onClick={() => setEditingTransaction(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Редактировать транзакцию</h2>
              <button 
                className="close-button" 
                onClick={() => setEditingTransaction(null)}
                aria-label="Закрыть"
              >
                <Plus size={20} style={{ transform: 'rotate(45deg)' }} />
              </button>
            </div>
            <div className="modal-body">
              <TransactionEditForm 
                transaction={editingTransaction}
                onSubmit={handleTransactionSuccess}
                onCancel={() => setEditingTransaction(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="toast-container">
        {toasts.map((toast) => (
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

// Компонент меню настроек
function SettingsMenu({ subTabs, onSubTabChange, activeSubTab }) {
  return (
    <div className="settings-menu">
      <div className="settings-header">
        <h2>Настройки</h2>
        <p>Управление приложением и данными</p>
      </div>
      
      <div className="settings-grid">
        {subTabs.map((subTab) => (
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

// Функция для получения описания настроек
function getSettingsDescription(subTabId) {
  const descriptions = {
    goals: 'Управление финансовыми целями',
    categories: 'Настройка категорий транзакций',
    budgets: 'Управление бюджетами и уведомлениями',
    notifications: 'Настройка уведомлений',
    backup: 'Резервное копирование данных',
    export: 'Экспорт данных в различные форматы'
  }
  return descriptions[subTabId] || ''
}

function App() {
  return (
    <ErrorBoundary>
      <TelegramProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </TelegramProvider>
    </ErrorBoundary>
  )
}

export default App
