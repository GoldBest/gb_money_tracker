import { useState } from 'react'
import { motion } from 'framer-motion'
import AnimatedCard from './AnimatedCard'
import AnimatedButton from './AnimatedButton'
import AnimatedInput from './AnimatedInput'
import AnimatedList from './AnimatedList'
import AnimatedToast from './AnimatedToast'
import { 
  Star, 
  Heart, 
  Zap, 
  Sparkles, 
  Palette, 
  Music, 
  Camera, 
  Gamepad2,
  Eye,
  Mail,
  Lock,
  Search,
  CheckCircle
} from 'lucide-react'

const AnimationDemo = () => {
  const [showToast, setShowToast] = useState(false)
  const [toastType, setToastType] = useState('success')
  const [inputValue, setInputValue] = useState('')
  const [selectedItems, setSelectedItems] = useState([])

  const demoItems = [
    { id: 1, name: 'Анимированная карточка 1', icon: '🌟' },
    { id: 2, name: 'Анимированная карточка 2', icon: '💫' },
    { id: 3, name: 'Анимированная карточка 3', icon: '✨' },
    { id: 4, name: 'Анимированная карточка 4', icon: '🎨' },
    { id: 5, name: 'Анимированная карточка 5', icon: '🎭' }
  ]

  const showDemoToast = (type) => {
    setToastType(type)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const renderDemoItem = (item, index, { isSelected, isHovered }) => (
    <AnimatedCard
      variant={isSelected ? 'gradient' : 'elevated'}
      hoverEffect="tilt"
      icon={item.icon}
      title={item.name}
      className={`demo-item ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
    >
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Это демонстрационная карточка с анимациями
      </p>
      <div className="mt-3 flex gap-2">
        <AnimatedButton
          variant="outline"
          size="small"
          onClick={() => showDemoToast('success')}
        >
          Успех
        </AnimatedButton>
        <AnimatedButton
          variant="outline"
          size="small"
          onClick={() => showDemoToast('error')}
        >
          Ошибка
        </AnimatedButton>
      </div>
    </AnimatedCard>
  )

  return (
    <div className="animation-demo p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          🎨 Демонстрация анимаций
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Изучите все доступные анимации и микроинтеракции
        </p>
      </motion.div>

      {/* Демонстрация карточек */}
      <section className="space-y-6">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-2xl font-semibold text-gray-900 dark:text-white"
        >
          🎴 Анимированные карточки
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatedCard
            variant="default"
            hoverEffect="lift"
            icon={<Star className="w-6 h-6 text-yellow-500" />}
            title="Подъем"
            subtitle="Hover эффект подъема"
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Карточка поднимается при наведении
            </p>
          </AnimatedCard>

          <AnimatedCard
            variant="elevated"
            hoverEffect="glow"
            icon={<Heart className="w-6 h-6 text-red-500" />}
            title="Свечение"
            subtitle="Hover эффект свечения"
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Карточка светится при наведении
            </p>
          </AnimatedCard>

          <AnimatedCard
            variant="glass"
            hoverEffect="scale"
            icon={<Zap className="w-6 h-6 text-blue-500" />}
            title="Масштаб"
            subtitle="Hover эффект масштабирования"
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Карточка увеличивается при наведении
            </p>
          </AnimatedCard>

          <AnimatedCard
            variant="gradient"
            hoverEffect="tilt"
            icon={<Sparkles className="w-6 h-6 text-purple-500" />}
            title="Наклон"
            subtitle="Hover эффект наклона"
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Карточка наклоняется при наведении
            </p>
          </AnimatedCard>

          <AnimatedCard
            variant="elevated"
            hoverEffect="lift"
            icon={<Palette className="w-6 h-6 text-green-500" />}
            title="Цвета"
            subtitle="Различные варианты оформления"
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Разнообразные цветовые схемы
            </p>
          </AnimatedCard>

          <AnimatedCard
            variant="glass"
            hoverEffect="glow"
            icon={<Music className="w-6 h-6 text-pink-500" />}
            title="Стекло"
            subtitle="Эффект матового стекла"
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Современный стеклянный дизайн
            </p>
          </AnimatedCard>
        </div>
      </section>

      {/* Демонстрация кнопок */}
      <section className="space-y-6">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-2xl font-semibold text-gray-900 dark:text-white"
        >
          🔘 Анимированные кнопки
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatedButton
            variant="primary"
            size="large"
            icon={<Camera className="w-5 h-5" />}
            onClick={() => showDemoToast('success')}
            fullWidth
          >
            Основная
          </AnimatedButton>

          <AnimatedButton
            variant="secondary"
            size="large"
            icon={<Gamepad2 className="w-5 h-5" />}
            onClick={() => showDemoToast('info')}
            fullWidth
          >
            Вторичная
          </AnimatedButton>

          <AnimatedButton
            variant="outline"
            size="large"
            icon={<Eye className="w-5 h-5" />}
            onClick={() => showDemoToast('warning')}
            fullWidth
          >
            Контурная
          </AnimatedButton>

          <AnimatedButton
            variant="ghost"
            size="large"
            icon={<Mail className="w-5 h-5" />}
            onClick={() => showDemoToast('error')}
            fullWidth
          >
            Призрачная
          </AnimatedButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AnimatedButton
            variant="primary"
            size="small"
            loading={true}
            fullWidth
          >
            Загрузка
          </AnimatedButton>

          <AnimatedButton
            variant="secondary"
            size="medium"
            disabled={true}
            fullWidth
          >
            Отключена
          </AnimatedButton>

          <AnimatedButton
            variant="outline"
            size="large"
            icon={<Lock className="w-5 h-5" />}
            iconPosition="right"
            fullWidth
          >
            Иконка справа
          </AnimatedButton>
        </div>
      </section>

      {/* Демонстрация полей ввода */}
      <section className="space-y-6">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-2xl font-semibold text-gray-900 dark:text-white"
        >
          📝 Анимированные поля ввода
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatedInput
            label="Обычное поле"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Введите текст..."
            leftIcon={<Search className="w-5 h-5" />}
          />

          <AnimatedInput
            label="Поле с ошибкой"
            value=""
            error="Это поле обязательно для заполнения"
            leftIcon={<Mail className="w-5 h-5" />}
          />

          <AnimatedInput
            label="Поле с успехом"
            value="Успешно заполнено"
            success="Поле заполнено корректно"
            leftIcon={<CheckCircle className="w-5 h-5" />}
          />

          <AnimatedInput
            label="Пароль"
            type="password"
            value="password123"
            showPasswordToggle={true}
            leftIcon={<Lock className="w-5 h-5" />}
          />
        </div>
      </section>

      {/* Демонстрация списков */}
      <section className="space-y-6">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-2xl font-semibold text-gray-900 dark:text-white"
        >
          📋 Анимированные списки
        </motion.h2>
        
        <AnimatedList
          items={demoItems}
          renderItem={renderDemoItem}
          keyExtractor={(item) => item.id}
          animationType="slideUp"
          staggerDelay={0.1}
          selectable={true}
          selectedItems={selectedItems}
          onSelectionChange={setSelectedItems}
          className="space-y-4"
        />
      </section>

      {/* Демонстрация уведомлений */}
      <section className="space-y-6">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.0, duration: 0.5 }}
          className="text-2xl font-semibold text-gray-900 dark:text-white"
        >
          🔔 Анимированные уведомления
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatedButton
            variant="outline"
            onClick={() => showDemoToast('success')}
            fullWidth
          >
            Успех
          </AnimatedButton>
          
          <AnimatedButton
            variant="outline"
            onClick={() => showDemoToast('error')}
            fullWidth
          >
            Ошибка
          </AnimatedButton>
          
          <AnimatedButton
            variant="outline"
            onClick={() => showDemoToast('warning')}
            fullWidth
          >
            Предупреждение
          </AnimatedButton>
          
          <AnimatedButton
            variant="outline"
            onClick={() => showDemoToast('info')}
            fullWidth
          >
            Информация
          </AnimatedButton>
        </div>
      </section>

      {/* Toast уведомления */}
      {showToast && (
        <AnimatedToast
          message={`Это ${toastType === 'success' ? 'успешное' : 
                   toastType === 'error' ? 'ошибочное' : 
                   toastType === 'warning' ? 'предупреждающее' : 
                   'информационное'} уведомление`}
          type={toastType}
          position="bottom-center"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  )
}

export default AnimationDemo
