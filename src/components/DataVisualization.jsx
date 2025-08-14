import { useState } from 'react'
import OptimizedParticleBackground from './OptimizedParticleBackground'

const DataVisualization = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('mood')

  // 模拟数据
  const moodData = [
    { date: '8/8', mood: 7, anxiety: 3 },
    { date: '8/9', mood: 6, anxiety: 4 },
    { date: '8/10', mood: 8, anxiety: 2 },
    { date: '8/11', mood: 5, anxiety: 6 },
    { date: '8/12', mood: 7, anxiety: 3 },
    { date: '8/13', mood: 9, anxiety: 1 },
    { date: '8/14', mood: 6, anxiety: 4 }
  ]

  const cbtData = {
    thoughtPattern: '我永远不会成功',
    beliefStrength: [
      { week: '第1周', strength: 85 },
      { week: '第2周', strength: 78 },
      { week: '第3周', strength: 65 },
      { week: '第4周', strength: 52 }
    ],
    cognitiveTraps: [
      { trap: '全或无思维', count: 8 },
      { trap: '过度概括', count: 12 },
      { trap: '心理过滤', count: 5 },
      { trap: '妄下结论', count: 7 }
    ]
  }

  const actData = {
    values: [
      { value: '家庭', importance: 9, action: 4 },
      { value: '友谊', importance: 8, action: 7 },
      { value: '学习', importance: 7, action: 8 },
      { value: '健康', importance: 6, action: 5 },
      { value: '创造力', importance: 5, action: 3 }
    ],
    psychologicalFlexibility: [
      { week: '第1周', score: 45 },
      { week: '第2周', score: 52 },
      { week: '第3周', score: 58 },
      { week: '第4周', score: 65 }
    ]
  }

  const tabs = [
    { id: 'mood', label: '情绪趋势', icon: '📊' },
    { id: 'cbt', label: 'CBT分析', icon: '🧠' },
    { id: 'act', label: 'ACT洞察', icon: '🎯' }
  ]

  const renderMoodChart = () => (
    <div className="space-y-6">
      {/* 情绪趋势图 */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <h3 className="text-white font-semibold mb-4 flex items-center">
          <span className="mr-2">📈</span>
          7天情绪趋势
        </h3>
        <div className="h-48 bg-white/5 rounded-xl p-4">
          <div className="flex items-end justify-between h-full space-x-2">
            {moodData.map((day, index) => (
              <div key={index} className="flex flex-col items-center space-y-2 flex-1">
                <div className="flex flex-col space-y-1">
                  {/* 心情条 */}
                  <div 
                    className="w-6 bg-gradient-to-t from-green-400 to-emerald-500 rounded-t"
                    style={{ height: `${day.mood * 12}px` }}
                  />
                  {/* 焦虑条 */}
                  <div 
                    className="w-6 bg-gradient-to-t from-red-400 to-pink-500 rounded-b"
                    style={{ height: `${day.anxiety * 8}px` }}
                  />
                </div>
                <span className="text-white/60 text-xs">{day.date}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded" />
            <span className="text-white/70 text-sm">心情</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-red-400 to-pink-500 rounded" />
            <span className="text-white/70 text-sm">焦虑</span>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
          <div className="text-2xl font-bold text-green-400 mb-1">7.1</div>
          <div className="text-white/70 text-sm">平均心情</div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
          <div className="text-2xl font-bold text-red-400 mb-1">3.3</div>
          <div className="text-white/70 text-sm">平均焦虑</div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
          <div className="text-2xl font-bold text-blue-400 mb-1">7</div>
          <div className="text-white/70 text-sm">记录天数</div>
        </div>
      </div>
    </div>
  )

  const renderCBTChart = () => (
    <div className="space-y-6">
      {/* 信念强度变化 */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <h3 className="text-white font-semibold mb-4 flex items-center">
          <span className="mr-2">📉</span>
          核心信念强度变化
        </h3>
        <div className="bg-white/5 rounded-xl p-4 mb-4">
          <p className="text-white/80 text-center mb-4">"{cbtData.thoughtPattern}"</p>
          <div className="h-32 flex items-end justify-between space-x-4">
            {cbtData.beliefStrength.map((week, index) => (
              <div key={index} className="flex flex-col items-center space-y-2 flex-1">
                <div 
                  className="w-8 bg-gradient-to-t from-yellow-400 to-orange-500 rounded-t"
                  style={{ height: `${week.strength * 0.8}px` }}
                />
                <span className="text-white/60 text-xs">{week.week}</span>
                <span className="text-white/80 text-xs font-semibold">{week.strength}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="text-center">
          <span className="text-green-400 text-sm">✓ 信念强度下降了 33%</span>
        </div>
      </div>

      {/* 认知陷阱分析 */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <h3 className="text-white font-semibold mb-4 flex items-center">
          <span className="mr-2">🕳️</span>
          认知陷阱分布
        </h3>
        <div className="space-y-3">
          {cbtData.cognitiveTraps.map((trap, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-20 text-white/80 text-sm">{trap.trap}</div>
              <div className="flex-1 bg-white/10 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full"
                  style={{ width: `${(trap.count / 12) * 100}%` }}
                />
              </div>
              <div className="w-8 text-white/60 text-sm text-right">{trap.count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderACTChart = () => (
    <div className="space-y-6">
      {/* 价值观雷达图 */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <h3 className="text-white font-semibold mb-4 flex items-center">
          <span className="mr-2">🎯</span>
          价值观对齐分析
        </h3>
        <div className="h-48 bg-white/5 rounded-xl flex items-center justify-center mb-4">
          <div className="text-center">
            <div className="w-32 h-32 border-2 border-white/20 rounded-full relative flex items-center justify-center mb-4">
              <span className="text-white/60">价值观雷达图</span>
              {/* 简化的雷达图表示 */}
              <div className="absolute top-2 w-2 h-2 bg-blue-400 rounded-full" />
              <div className="absolute right-2 w-2 h-2 bg-green-400 rounded-full" />
              <div className="absolute bottom-2 w-2 h-2 bg-yellow-400 rounded-full" />
              <div className="absolute left-2 w-2 h-2 bg-red-400 rounded-full" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {actData.values.map((item, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-3">
              <div className="text-white/80 text-sm mb-2">{item.value}</div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-white/60">重要性:</span>
                <span className="text-blue-400">{item.importance}</span>
                <span className="text-white/60">行动:</span>
                <span className="text-green-400">{item.action}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 心理灵活性趋势 */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <h3 className="text-white font-semibold mb-4 flex items-center">
          <span className="mr-2">🌊</span>
          心理灵活性发展
        </h3>
        <div className="h-32 bg-white/5 rounded-xl p-4">
          <div className="flex items-end justify-between h-full space-x-4">
            {actData.psychologicalFlexibility.map((week, index) => (
              <div key={index} className="flex flex-col items-center space-y-2 flex-1">
                <div 
                  className="w-8 bg-gradient-to-t from-cyan-400 to-blue-500 rounded-t"
                  style={{ height: `${week.score}px` }}
                />
                <span className="text-white/60 text-xs">{week.week}</span>
                <span className="text-white/80 text-xs font-semibold">{week.score}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="text-center mt-4">
          <span className="text-green-400 text-sm">✓ 心理灵活性提升了 44%</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 背景 */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url("/src/assets/data-bg.webp")`,
          filter: 'brightness(0.7)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 via-indigo-900/30 to-purple-900/50" />
      
      <OptimizedParticleBackground color="#3B82F6" quantity={6} />

      <div className="relative z-10 min-h-screen p-6">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
          >
            <span className="text-xl">←</span>
            <span>返回</span>
          </button>
          <h1 className="text-xl font-bold text-white">数据可视化</h1>
          <div className="w-16" />
        </div>

        {/* 标签页 */}
        <div className="flex space-x-2 mb-6 bg-white/10 backdrop-blur-sm rounded-xl p-2 border border-white/20">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* 内容区域 */}
        <div className="pb-6">
          {activeTab === 'mood' && renderMoodChart()}
          {activeTab === 'cbt' && renderCBTChart()}
          {activeTab === 'act' && renderACTChart()}
        </div>
      </div>
    </div>
  )
}

export default DataVisualization

