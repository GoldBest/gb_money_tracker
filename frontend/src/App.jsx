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
  Download
} from 'lucide-react'
import './styles/apple-theme.css'
import './mobile.css'
import './styles/animations.css'
import './styles/apple-animations.css'
import './styles/apple-transitions.css'

function AppContent() {
  const { isDark, toggleTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [toasts, setToasts] = useState([])

  const tabs = [
    { id: 'dashboard', label: 'Главная', icon: <BarChart3 size={20} /> },
    { id: 'transactions', label: 'Транзакции', icon: <List size={20} /> },
    { id: 'statistics', label: 'Статистика', icon: <TrendingUp size={20} /> },
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
      
      // Ctrl/Cmd + 1-9 - переключение табов
      if ((event.ctrlKey || event.metaKey) && ['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(event.key)) {
        event.preventDefault()
        const tabIndex = parseInt(event.key) - 1
        if (tabs[tabIndex]) {
          setActiveTab(tabs[tabIndex].id)
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

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onAddTransaction={() => setShowTransactionForm(true)} />
      case 'transactions':
        return <TransactionList onEditTransaction={handleEditTransaction} />
      case 'statistics':
        return <Statistics />
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
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="app-main">
        <AppleTabTransition 
          key={activeTab}
          activeTab={activeTab}
          tabId={activeTab}
          direction="right"
          duration={300}
        >
          {renderContent()}
        </AppleTabTransition>
      </main>

      {/* Floating Action Button */}
      <button
        className="apple-button primary"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          boxShadow: 'var(--apple-shadow-lg)',
          zIndex: 1000
        }}
        onClick={() => setShowTransactionForm(true)}
        aria-label="Добавить транзакцию"
      >
        <Plus size={24} />
      </button>

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

      {/* Toast notifications */}
      <div style={{ position: 'fixed', top: '100px', right: '24px', zIndex: 1001 }}>
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
