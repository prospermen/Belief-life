import { useState, useEffect } from 'react'
import { Line, Radar } from 'recharts'
import OptimizedParticleBackground from './OptimizedParticleBackground'

const SmartInsights = ({ onBack }) => {
  const [insights, setInsights] = useState([])
  const [selectedInsight, setSelectedInsight] = useState(null)

  // 模拟智能洞察数据
  useEffect(() => {
    const mockInsights = [
      {
        id: 1,
        type: 'pattern',
        title: '情绪模式发现',
        description: '我们发现，你记录的焦虑情绪大多出现在周日下午。这通常与"周一恐惧症"有关。',
        icon: '📊',
        severity: 'medium',
        suggestions: [
          '尝试在周日安排一些愉快的活动',
          '提前准备周一的工作计划',
          '练习放松技巧来缓解预期焦虑'
        ],
        data: [
          { day: '周一', anxiety: 3 },
          { day: '周二', anxiety: 2 },
          { day: '周三', anxiety: 2 },
          { day: '周四', anxiety: 3 },
          { day: '周五', anxiety: 1 },
          { day: '周六', anxiety: 1 },
          { day: '周日', anxiety: 7 }
        ]
      },
      {
        id: 2,
        type: 'cbt_act_fusion',
        title: 'CBT与ACT融合建议',
        description: '这个念头似乎很有粘性。想不想试试一个"思维游戏"来减少它的困扰？',
        icon: '🧠',
        severity: 'high',
        suggestions: [
          '尝试"思维列车"练习，观察想法而不跳上车',
          '使用"感谢大脑"技巧来与想法保持距离',
          '继续CBT分析来挑战这个想法的真实性'
        ],
        triggerThought: '我永远不会成功'
      },
      {
        id: 3,
        type: 'value_alignment',
        title: '价值观对齐分析',
        description: '你在"家庭"价值观上的行动投入较少，但这是你选择的重要价值观之一。',
        icon: '🧭',
        severity: 'medium',
        suggestions: [
          '安排更多与家人共度的时光',
          '主动联系家庭成员',
          '在日常决策中考虑家庭价值观'
        ],
        valueData: [
          { value: '家庭', importance: 9, action: 4 },
          { value: '友谊', importance: 8, action: 7 },
          { value: '学习', importance: 7, action: 8 },
          { value: '健康', importance: 6, action: 5 }
        ]
      }
    ]
    setInsights(mockInsights)
  }, [])

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'from-red-400 to-pink-500'
      case 'medium': return 'from-yellow-400 to-orange-500'
      case 'low': return 'from-green-400 to-emerald-500'
      default: return 'from-blue-400 to-cyan-500'
    }
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return '🚨'
      case 'medium': return '⚠️'
      case 'low': return '💡'
      default: return 'ℹ️'
    }
  }

  if (selectedInsight) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* 背景 */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url("/src/assets/insights-bg.webp")`,
            filter: 'brightness(0.7)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/40 via-purple-900/30 to-blue-900/50" />
        
        <OptimizedParticleBackground color="#8B5CF6" quantity={6} />

        <div className="relative z-10 min-h-screen p-6">
          {/* 顶部导航 */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setSelectedInsight(null)}
              className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
            >
              <span className="text-xl">←</span>
              <span>返回</span>
            </button>
            <h1 className="text-xl font-bold text-white">洞察详情</h1>
            <div className="w-16" />
          </div>

          {/* 洞察详情 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-6">
            <div className="flex items-start space-x-4 mb-4">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getSeverityColor(selectedInsight.severity)} flex items-center justify-center text-2xl shadow-lg`}>
                {selectedInsight.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h2 className="text-xl font-bold text-white">{selectedInsight.title}</h2>
                  <span className="text-lg">{getSeverityIcon(selectedInsight.severity)}</span>
                </div>
                <p className="text-white/80 leading-relaxed">
                  {selectedInsight.description}
                </p>
              </div>
            </div>

            {/* 数据可视化 */}
            {selectedInsight.data && (
              <div className="bg-white/5 rounded-xl p-4 mb-4">
                <h3 className="text-white font-semibold mb-3">数据趋势</h3>
                <div className="h-48 bg-white/10 rounded-lg flex items-center justify-center">
                  <span className="text-white/60">📈 焦虑情绪周趋势图</span>
                </div>
              </div>
            )}

            {/* 价值观雷达图 */}
            {selectedInsight.valueData && (
              <div className="bg-white/5 rounded-xl p-4 mb-4">
                <h3 className="text-white font-semibold mb-3">价值观对齐分析</h3>
                <div className="h-48 bg-white/10 rounded-lg flex items-center justify-center">
                  <span className="text-white/60">🎯 价值观重要性 vs 行动投入雷达图</span>
                </div>
              </div>
            )}

            {/* 建议列表 */}
            <div>
              <h3 className="text-white font-semibold mb-3 flex items-center">
                <span className="mr-2">💡</span>
                个性化建议
              </h3>
              <div className="space-y-3">
                {selectedInsight.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="bg-white/5 rounded-lg p-3 border border-white/10"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center text-xs font-bold text-white mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-white/90 leading-relaxed flex-1">
                        {suggestion}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 行动按钮 */}
          <div className="flex space-x-4">
            <button className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-lg">
              开始练习
            </button>
            <button className="flex-1 bg-white/10 backdrop-blur-sm text-white py-3 px-6 rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-all duration-300">
              稍后提醒
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 背景 */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url("/src/assets/insights-bg.webp")`,
          filter: 'brightness(0.7)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/40 via-purple-900/30 to-blue-900/50" />
      
      <OptimizedParticleBackground color="#8B5CF6" quantity={6} />

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
          <h1 className="text-xl font-bold text-white">智能洞察</h1>
          <div className="w-16" />
        </div>

        {/* 页面标题 */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center shadow-lg">
            <span className="text-3xl">🔍</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">个性化洞察</h2>
          <p className="text-white/80">基于你的数据，发现模式和提供建议</p>
        </div>

        {/* 洞察卡片列表 */}
        <div className="space-y-4 mb-6">
          {insights.map((insight) => (
            <div
              key={insight.id}
              onClick={() => setSelectedInsight(insight)}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/20 hover:border-purple-400/50 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-start space-x-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getSeverityColor(insight.severity)} flex items-center justify-center text-2xl shadow-lg`}>
                  {insight.icon}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-white font-semibold">
                      {insight.title}
                    </h3>
                    <span className="text-sm">{getSeverityIcon(insight.severity)}</span>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed mb-3">
                    {insight.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/50">
                      {insight.suggestions.length} 个建议
                    </span>
                    <span className="text-white/40 text-xl">→</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 底部提示 */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
            <span className="text-yellow-400">💡</span>
            <span className="text-white/70 text-sm">
              洞察每天更新，帮助你更好地了解自己
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SmartInsights

