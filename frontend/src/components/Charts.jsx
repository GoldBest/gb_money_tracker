import { useState } from 'react'
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Scatter,
  Brush
} from 'recharts'

// Круговая диаграмма для категорий с улучшенной интерактивностью
export const CategoryPieChart = ({ data, title }) => {
  const [activeIndex, setActiveIndex] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)

  const COLORS = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
    '#F97316', '#6366F1', '#14B8A6', '#F43F5E'
  ]

  const onPieEnter = (_, index) => {
    setActiveIndex(index)
  }

  const onPieLeave = () => {
    setActiveIndex(null)
  }

  const onPieClick = (entry) => {
    setSelectedCategory(selectedCategory === entry.name ? null : entry.name)
  }

  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <h3>{title}</h3>
        <div className="empty-chart">
          <p>Нет данных для отображения</p>
        </div>
      </div>
    )
  }

  return (
    <div className="chart-container">
      <h3>{title}</h3>
      {selectedCategory && (
        <div className="selected-category">
          <span>Выбрано: {selectedCategory}</span>
          <button onClick={() => setSelectedCategory(null)}>Сбросить</button>
        </div>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={selectedCategory ? 90 : 80}
            innerRadius={selectedCategory ? 30 : 0}
            fill="#8884d8"
            dataKey="total"
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            onClick={onPieClick}
            activeIndex={activeIndex}
            activeShape={(props) => {
              const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props
              return (
                <g>
                  <path
                    d={`M ${cx} ${cy} m ${innerRadius} 0 a ${innerRadius} ${innerRadius} 0 0 1 ${outerRadius - innerRadius} 0 a ${outerRadius} ${outerRadius} 0 0 1 -${outerRadius - innerRadius} 0 Z`}
                    fill={fill}
                  />
                  <path
                    d={`M ${cx} ${cy} m ${innerRadius} 0 a ${innerRadius} ${innerRadius} 0 0 1 ${outerRadius - innerRadius} 0 a ${outerRadius} ${outerRadius} 0 0 1 -${outerRadius - innerRadius} 0 Z`}
                    fill={fill}
                    opacity={0.3}
                  />
                </g>
              )
            }}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
                opacity={selectedCategory && selectedCategory !== entry.name ? 0.3 : 1}
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${value.toLocaleString('ru-RU')} ₽`, 'Сумма']}
            labelFormatter={(label) => `Категория: ${label}`}
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              border: 'none',
              borderRadius: '8px',
              color: 'white'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

// Областной график для трендов с заливкой
export const TrendAreaChart = ({ data, title }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <h3>{title}</h3>
        <div className="empty-chart">
          <p>Нет данных для отображения</p>
        </div>
      </div>
    )
  }

  return (
    <div className="chart-container">
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${value.toLocaleString('ru-RU')} ₽`}
          />
          <Tooltip 
            formatter={(value) => [`${value.toLocaleString('ru-RU')} ₽`, 'Сумма']}
            labelFormatter={(label) => `Дата: ${label}`}
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              border: 'none',
              borderRadius: '8px',
              color: 'white'
            }}
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="income" 
            stackId="1"
            stroke="#10B981" 
            fill="url(#incomeGradient)"
            fillOpacity={0.6}
            name="Доходы"
          />
          <Area 
            type="monotone" 
            dataKey="expense" 
            stackId="1"
            stroke="#EF4444" 
            fill="url(#expenseGradient)"
            fillOpacity={0.6}
            name="Расходы"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// Линейный график для трендов с улучшенным дизайном
export const TrendLineChart = ({ data, title }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <h3>{title}</h3>
        <div className="empty-chart">
          <p>Нет данных для отображения</p>
        </div>
      </div>
    )
  }

  return (
    <div className="chart-container">
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12, fill: '#9CA3AF' }}
            angle={-45}
            textAnchor="end"
            height={80}
            stroke="#6B7280"
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#9CA3AF' }}
            tickFormatter={(value) => `${value.toLocaleString('ru-RU')} ₽`}
            stroke="#6B7280"
          />
          <Tooltip 
            formatter={(value) => [`${value.toLocaleString('ru-RU')} ₽`, 'Сумма']}
            labelFormatter={(label) => `Дата: ${label}`}
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="income" 
            stroke="#10B981" 
            strokeWidth={3}
            name="Доходы"
            dot={{ fill: '#10B981', strokeWidth: 2, r: 5 }}
            activeDot={{ r: 8, stroke: '#10B981', strokeWidth: 2, fill: '#fff' }}
            animationDuration={1000}
          />
          <Line 
            type="monotone" 
            dataKey="expense" 
            stroke="#EF4444" 
            strokeWidth={3}
            name="Расходы"
            dot={{ fill: '#EF4444', strokeWidth: 2, r: 5 }}
            activeDot={{ r: 8, stroke: '#EF4444', strokeWidth: 2, fill: '#fff' }}
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// Радарная диаграмма для сравнения категорий
export const CategoryRadarChart = ({ data, title }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <h3>{title}</h3>
        <div className="empty-chart">
          <p>Нет данных для отображения</p>
        </div>
      </div>
    )
  }

  return (
    <div className="chart-container">
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid stroke="#374151" opacity={0.3} />
          <PolarAngleAxis 
            dataKey="name" 
            tick={{ fontSize: 12, fill: '#9CA3AF' }}
          />
          <PolarRadiusAxis 
            tick={{ fontSize: 10, fill: '#6B7280' }}
            tickFormatter={(value) => `${value.toLocaleString('ru-RU')} ₽`}
          />
          <Radar
            name="Расходы"
            dataKey="amount"
            stroke="#EF4444"
            fill="#EF4444"
            fillOpacity={0.3}
            strokeWidth={2}
            dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
          />
          <Tooltip 
            formatter={(value) => [`${value.toLocaleString('ru-RU')} ₽`, 'Сумма']}
            labelFormatter={(label) => `Категория: ${label}`}
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              border: 'none',
              borderRadius: '8px',
              color: 'white'
            }}
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Комбинированный график для детального анализа
export const ComposedAnalysisChart = ({ data, title }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <h3>{title}</h3>
        <div className="empty-chart">
          <p>Нет данных для отображения</p>
        </div>
      </div>
    )
  }

  return (
    <div className="chart-container">
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12, fill: '#9CA3AF' }}
            angle={-45}
            textAnchor="end"
            height={80}
            stroke="#6B7280"
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#9CA3AF' }}
            tickFormatter={(value) => `${value.toLocaleString('ru-RU')} ₽`}
            stroke="#6B7280"
          />
          <Tooltip 
            formatter={(value) => [`${value.toLocaleString('ru-RU')} ₽`, 'Сумма']}
            labelFormatter={(label) => `Дата: ${label}`}
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
            }}
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="balance" 
            fill="#3B82F6" 
            fillOpacity={0.1}
            stroke="#3B82F6"
            strokeWidth={1}
            name="Баланс"
          />
          <Bar 
            dataKey="expense" 
            fill="#EF4444" 
            radius={[4, 4, 0, 0]}
            name="Расходы"
            opacity={0.8}
          />
          <Bar 
            dataKey="income" 
            fill="#10B981" 
            radius={[4, 4, 0, 0]}
            name="Доходы"
            opacity={0.8}
          />
          <Line 
            type="monotone" 
            dataKey="trend" 
            stroke="#8B5CF6" 
            strokeWidth={2}
            name="Тренд"
            dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 3 }}
            strokeDasharray="5 5"
          />
          <Brush dataKey="date" height={30} stroke="#6B7280" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

// Столбчатая диаграмма для сравнения с улучшенным дизайном
export const ComparisonBarChart = ({ data, title }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <h3>{title}</h3>
        <div className="empty-chart">
          <p>Нет данных для отображения</p>
        </div>
      </div>
    )
  }

  return (
    <div className="chart-container">
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12, fill: '#9CA3AF' }}
            angle={-45}
            textAnchor="end"
            height={80}
            stroke="#6B7280"
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#9CA3AF' }}
            tickFormatter={(value) => `${value.toLocaleString('ru-RU')} ₽`}
            stroke="#6B7280"
          />
          <Tooltip 
            formatter={(value) => [`${value.toLocaleString('ru-RU')} ₽`, 'Сумма']}
            labelFormatter={(label) => `Категория: ${label}`}
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              border: 'none',
              borderRadius: '8px',
              color: 'white'
            }}
          />
          <Legend />
          <Bar 
            dataKey="amount" 
            fill="#667eea" 
            radius={[4, 4, 0, 0]}
            name="Сумма"
            animationDuration={1000}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Мини-график для дашборда с улучшенной анимацией
export const MiniChart = ({ data, type = 'line', color = 'currentColor' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="mini-chart">
        <div className="empty-mini-chart">
          <span>Нет данных</span>
        </div>
      </div>
    )
  }

  return (
    <div className="mini-chart">
      <ResponsiveContainer width="100%" height={60}>
        {type === 'line' ? (
          <LineChart data={data}>
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={2}
              dot={false}
              animationDuration={1500}
            />
          </LineChart>
        ) : (
          <BarChart data={data}>
            <Bar 
              dataKey="value" 
              fill={color} 
              radius={[2, 2, 0, 0]}
              animationDuration={1000}
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}

// Новый компонент: График прогресса целей
export const GoalProgressChart = ({ data, title }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <h3>{title}</h3>
        <div className="empty-chart">
          <p>Нет данных для отображения</p>
        </div>
      </div>
    )
  }

  return (
    <div className="chart-container">
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis 
            type="number"
            tick={{ fontSize: 12, fill: '#9CA3AF' }}
            tickFormatter={(value) => `${value.toLocaleString('ru-RU')} ₽`}
            stroke="#6B7280"
          />
          <YAxis 
            type="category"
            dataKey="name" 
            tick={{ fontSize: 12, fill: '#9CA3AF' }}
            stroke="#6B7280"
          />
          <Tooltip 
            formatter={(value) => [`${value.toLocaleString('ru-RU')} ₽`, 'Прогресс']}
            labelFormatter={(label) => `Цель: ${label}`}
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              border: 'none',
              borderRadius: '8px',
              color: 'white'
            }}
          />
          <Legend />
          <Bar 
            dataKey="current" 
            fill="#10B981" 
            radius={[0, 4, 4, 0]}
            name="Текущий прогресс"
            animationDuration={1000}
          />
          <Bar 
            dataKey="target" 
            fill="#6B7280" 
            radius={[0, 4, 4, 0]}
            name="Целевая сумма"
            opacity={0.3}
            animationDuration={1000}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
