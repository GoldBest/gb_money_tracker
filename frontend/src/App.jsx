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
import AnimationDemo from './components/AnimationDemo'
import TelegramInfo from './components/TelegramInfo'
import { Moon, Sun, Plus } from 'lucide-react'
import './App.css'
import './mobile.css'
import './styles/animations.css'

function AppContent() {
  const { isDark, toggleTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [toasts, setToasts] = useState([])

  const tabs = [
    { id: 'dashboard', label: 'Главная', icon: '📊' },
    { id: 'transactions', label: 'Транзакции', icon: '📝' },
    { id: 'statistics', label: 'Статистика', icon: '📈' },
    { id: 'goals', label: 'Цели', icon: '🎯' },
    { id: 'categories', label: 'Категории', icon: '🏷️' },
    { id: 'budgets', label: 'Бюджеты', icon: '💰' },
    { id: 'notifications', label: 'Уведомления', icon: '🔔' },
    { id: 'backup', label: 'Резервные копии', icon: '💾' },
    { id: 'export', label: 'Экспорт', icon: '📤' },
    { id: 'demo', label: 'Демо', icon: '🎨' }
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
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <ErrorBoundary>
      <TelegramProvider>
        <div className="app">
          {/* Информация о версии Telegram Web App */}
          <TelegramInfo />
          
          <header className="app-header">
            <h1>💰 GB Money Tracker</h1>
            <AnimatedButton
              variant="outline"
              size="small"
              onClick={toggleTheme}
              title={`Переключить на ${isDark ? 'светлую' : 'темную'} тему`}
              className="theme-toggle"
              icon={isDark ? <Sun size={20} /> : <Moon size={20} />}
            />
          </header>

          <main className="app-main">
            <AnimatedTransition 
              isVisible={activeTab === 'dashboard'} 
              direction="right"
              animationType="fade"
              duration={0.4}
            >
              {activeTab === 'dashboard' && (
                <Dashboard onAddTransaction={() => setShowTransactionForm(true)} />
              )}
            </AnimatedTransition>
            
            <AnimatedTransition 
              isVisible={activeTab === 'transactions'} 
              direction="right"
              animationType="slide"
              duration={0.3}
            >
              {activeTab === 'transactions' && (
                <TransactionList onEditTransaction={handleEditTransaction} />
              )}
            </AnimatedTransition>
            
            <AnimatedTransition 
              isVisible={activeTab === 'statistics'} 
              direction="right"
              animationType="scale"
              duration={0.4}
            >
              {activeTab === 'statistics' && (
                <Statistics />
              )}
            </AnimatedTransition>

            <AnimatedTransition 
              isVisible={activeTab === 'goals'} 
              direction="right"
              animationType="parallax"
              duration={0.5}
            >
              {activeTab === 'goals' && (
                <GoalManager />
              )}
            </AnimatedTransition>

            <AnimatedTransition 
              isVisible={activeTab === 'categories'} 
              direction="right"
              animationType="slide"
              duration={0.3}
            >
              {activeTab === 'categories' && (
                <CategoryManager />
              )}
            </AnimatedTransition>

            <AnimatedTransition 
              isVisible={activeTab === 'budgets'} 
              direction="right"
              animationType="fade"
              duration={0.4}
            >
              {activeTab === 'budgets' && (
                <BudgetAlertManager />
              )}
            </AnimatedTransition>

            <AnimatedTransition 
              isVisible={activeTab === 'notifications'} 
              direction="right"
              animationType="scale"
              duration={0.4}
            >
              {activeTab === 'notifications' && (
                <NotificationManager />
              )}
            </AnimatedTransition>

            <AnimatedTransition 
              isVisible={activeTab === 'backup'} 
              direction="right"
              animationType="slide"
              duration={0.3}
            >
              {activeTab === 'backup' && (
                <BackupManager />
              )}
            </AnimatedTransition>

            <AnimatedTransition 
              isVisible={activeTab === 'export'} 
              direction="right"
              animationType="fade"
              duration={0.4}
            >
              {activeTab === 'export' && (
                <DataExporter />
              )}
            </AnimatedTransition>

            <AnimatedTransition 
              isVisible={activeTab === 'demo'} 
              direction="right"
              animationType="parallax"
              duration={0.5}
            >
              {activeTab === 'demo' && (
                <AnimationDemo />
              )}
            </AnimatedTransition>
          </main>

          <nav className="app-nav">
            {tabs.map((tab, index) => (
              <AnimatedButton
                key={tab.id}
                variant={activeTab === tab.id ? 'primary' : 'secondary'}
                size="small"
                onClick={() => setActiveTab(tab.id)}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                icon={<span className="nav-icon">{tab.icon}</span>}
                iconPosition="left"
              >
                <span className="nav-label">{tab.label}</span>
              </AnimatedButton>
            ))}
          </nav>

          {showTransactionForm && (
            <TransactionForm 
              onClose={() => setShowTransactionForm(false)}
              onSuccess={handleTransactionSuccess}
            />
          )}

          {editingTransaction && (
            <TransactionEditForm
              transaction={editingTransaction}
              onClose={() => setEditingTransaction(null)}
              onSuccess={handleTransactionSuccess}
            />
          )}

          {/* Floating Action Button for mobile */}
          <AnimatedButton
            variant="primary"
            size="large"
            onClick={() => setShowTransactionForm(true)}
            title="Добавить транзакцию"
            aria-label="Добавить транзакцию"
            className="floating-action-button"
          >
            <Plus size={24} />
          </AnimatedButton>

          {/* Toast уведомления */}
          {toasts.map(toast => (
            <AnimatedToast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
              position="top-right"
            />
          ))}
        </div>
      </TelegramProvider>
    </ErrorBoundary>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App
