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
import { Moon, Sun, Plus } from 'lucide-react'
import './App.css'
import './mobile.css'

function AppContent() {
  const { isDark, toggleTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)

  const tabs = [
    { id: 'dashboard', label: 'Главная', icon: '📊' },
    { id: 'transactions', label: 'Транзакции', icon: '📝' },
    { id: 'statistics', label: 'Статистика', icon: '📈' },
    { id: 'goals', label: 'Цели', icon: '🎯' },
    { id: 'categories', label: 'Категории', icon: '🏷️' },
    { id: 'budgets', label: 'Бюджеты', icon: '💰' },
    { id: 'notifications', label: 'Уведомления', icon: '🔔' },
    { id: 'backup', label: 'Резервные копии', icon: '💾' },
    { id: 'export', label: 'Экспорт', icon: '📤' }
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
    // Здесь можно добавить обновление данных
  }

  return (
    <ErrorBoundary>
      <TelegramProvider>
        <div className="app">
          <header className="app-header">
            <h1>💰 GB Money Tracker</h1>
            <button 
              className="theme-toggle"
              onClick={toggleTheme}
              title={`Переключить на ${isDark ? 'светлую' : 'темную'} тему`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </header>

          <main className="app-main">
            <AnimatedTransition isVisible={activeTab === 'dashboard'} direction="right">
              {activeTab === 'dashboard' && (
                <Dashboard onAddTransaction={() => setShowTransactionForm(true)} />
              )}
            </AnimatedTransition>
            
            <AnimatedTransition isVisible={activeTab === 'transactions'} direction="right">
              {activeTab === 'transactions' && (
                <TransactionList onEditTransaction={handleEditTransaction} />
              )}
            </AnimatedTransition>
            
            <AnimatedTransition isVisible={activeTab === 'statistics'} direction="right">
              {activeTab === 'statistics' && (
                <Statistics />
              )}
            </AnimatedTransition>

            <AnimatedTransition isVisible={activeTab === 'goals'} direction="right">
              {activeTab === 'goals' && (
                <GoalManager />
              )}
            </AnimatedTransition>

            <AnimatedTransition isVisible={activeTab === 'categories'} direction="right">
              {activeTab === 'categories' && (
                <CategoryManager />
              )}
            </AnimatedTransition>

            <AnimatedTransition isVisible={activeTab === 'budgets'} direction="right">
              {activeTab === 'budgets' && (
                <BudgetAlertManager />
              )}
            </AnimatedTransition>

            <AnimatedTransition isVisible={activeTab === 'notifications'} direction="right">
              {activeTab === 'notifications' && (
                <NotificationManager />
              )}
            </AnimatedTransition>

            <AnimatedTransition isVisible={activeTab === 'backup'} direction="right">
              {activeTab === 'backup' && (
                <BackupManager />
              )}
            </AnimatedTransition>

            <AnimatedTransition isVisible={activeTab === 'export'} direction="right">
              {activeTab === 'export' && (
                <DataExporter />
              )}
            </AnimatedTransition>
          </main>

          <nav className="app-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="nav-icon">{tab.icon}</span>
                <span className="nav-label">{tab.label}</span>
              </button>
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
          <button
            className="floating-action-button"
            onClick={() => setShowTransactionForm(true)}
            title="Добавить транзакцию"
            aria-label="Добавить транзакцию"
          >
            <Plus size={24} />
          </button>
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
