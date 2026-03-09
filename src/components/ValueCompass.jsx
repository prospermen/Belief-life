import { useEffect, useMemo, useRef, useState } from 'react'
import OptimizedParticleBackground from './OptimizedParticleBackground'
import AIFeedbackPanel from './AIFeedbackPanel'
import { requestDailyJourneyFeedback } from '../lib/aiDailyFeedback'

const VALUE_CATEGORIES = {
  relationships: {
    title: '人际关系',
    icon: '👥',
    color: 'from-pink-500 to-rose-500',
    values: [
      { id: 'family', name: '家庭', description: '与家人建立深厚的联系' },
      { id: 'friendship', name: '友谊', description: '培养真诚的友谊关系' },
      { id: 'love', name: '爱情', description: '寻找和维护浪漫关系' },
      { id: 'community', name: '社区', description: '参与社区活动，帮助他人' },
      { id: 'connection', name: '连接', description: '与他人建立有意义的联系' }
    ]
  },
  work: {
    title: '工作事业',
    icon: '💼',
    color: 'from-blue-500 to-indigo-500',
    values: [
      { id: 'achievement', name: '成就', description: '追求卓越和成功' },
      { id: 'creativity', name: '创造力', description: '发挥创新和想象力' },
      { id: 'leadership', name: '领导力', description: '引导和影响他人' },
      { id: 'learning', name: '学习', description: '不断获取新知识和技能' },
      { id: 'contribution', name: '贡献', description: '为社会做出有价值的贡献' }
    ]
  },
  personal: {
    title: '个人成长',
    icon: '🌱',
    color: 'from-green-500 to-emerald-500',
    values: [
      { id: 'health', name: '健康', description: '保持身心健康' },
      { id: 'spirituality', name: '精神', description: '追求精神层面的成长' },
      { id: 'adventure', name: '冒险', description: '探索新的体验和挑战' },
      { id: 'freedom', name: '自由', description: '拥有选择和决定的自由' },
      { id: 'authenticity', name: '真实', description: '做真实的自己' }
    ]
  },
  leisure: {
    title: '休闲娱乐',
    icon: '🎨',
    color: 'from-purple-500 to-violet-500',
    values: [
      { id: 'fun', name: '乐趣', description: '享受生活中的快乐时光' },
      { id: 'beauty', name: '美感', description: '欣赏和创造美好事物' },
      { id: 'nature', name: '自然', description: '与大自然和谐相处' },
      { id: 'culture', name: '文化', description: '体验不同的文化和艺术' },
      { id: 'peace', name: '平静', description: '寻求内心的宁静和平衡' }
    ]
  }
}

const ValueCompass = ({ onComplete, onBack }) => {
  const [currentPhase, setCurrentPhase] = useState('explore') // explore, action, commit
  const [selectedValues, setSelectedValues] = useState({})
  const [actionPlan, setActionPlan] = useState('')
  const [aiFeedback, setAiFeedback] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const aiRequestRef = useRef(0)

  const handleValueToggle = (categoryId, valueId) => {
    const key = `${categoryId}_${valueId}`
    setSelectedValues(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const selectedValuesCount = useMemo(() => {
    return Object.values(selectedValues).filter(Boolean).length
  }, [selectedValues])

  const selectedValuesText = useMemo(() => {
    const selected = []
    Object.entries(VALUE_CATEGORIES).forEach(([categoryId, category]) => {
      category.values.forEach(value => {
        const key = `${categoryId}_${value.id}`
        if (selectedValues[key]) {
          selected.push(value.name)
        }
      })
    })
    return selected.join('、')
  }, [selectedValues])

  const handlePhaseNext = () => {
    if (currentPhase === 'explore' && selectedValuesCount > 0) {
      setCurrentPhase('action')
    } else if (currentPhase === 'action' && actionPlan.trim().length > 10) {
      setCurrentPhase('commit')
    } else if (currentPhase === 'commit') {
      onComplete({
        selectedValues: selectedValues,
        actionPlan: actionPlan,
        selectedValuesText,
        aiFeedback,
      })
    }
  }

  const handlePhasePrevious = () => {
    if (currentPhase === 'action') {
      setCurrentPhase('explore')
    } else if (currentPhase === 'commit') {
      setCurrentPhase('action')
    }
  }

  const renderExplorePhase = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🧭</div>
        <h2 className="text-3xl font-bold text-white mb-2">探索你的价值观</h2>
        <p className="text-white/80 text-lg mb-4">
          选择对你最重要的价值观（可多选）
        </p>
        <div className="text-white/60 text-sm">
          已选择 {selectedValuesCount} 个价值观
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(VALUE_CATEGORIES).map(([categoryId, category]) => (
          <div key={categoryId} className="space-y-3">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center`}>
                <span className="text-lg">{category.icon}</span>
              </div>
              <h3 className="text-white font-semibold text-lg">{category.title}</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {category.values.map(value => {
                const key = `${categoryId}_${value.id}`
                const isSelected = selectedValues[key]
                
                return (
                  <button
                    key={value.id}
                    onClick={() => handleValueToggle(categoryId, value.id)}
                    className={`p-4 rounded-lg border transition-all duration-300 text-left ${
                      isSelected
                        ? `bg-gradient-to-r ${category.color} bg-opacity-30 border-white/40 text-white`
                        : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium mb-1">{value.name}</h4>
                        <p className="text-sm opacity-80">{value.description}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'bg-white border-white' : 'border-white/40'
                      }`}>
                        {isSelected && <span className="text-purple-600 text-sm">✓</span>}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderActionPhase = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🎯</div>
        <h2 className="text-3xl font-bold text-white mb-2">制定行动计划</h2>
        <p className="text-white/80 text-lg mb-4">
          基于你选择的价值观，设定一个具体的今日行动
        </p>
      </div>

      {/* 选中的价值观回顾 */}
      <div className="bg-white/5 rounded-lg p-4 mb-6">
        <h3 className="text-white font-medium mb-2">你选择的价值观：</h3>
        <p className="text-white/80 text-sm">{selectedValuesText}</p>
      </div>

      {/* 行动计划输入 */}
      <div className="space-y-4">
        <label className="block text-white font-medium">
          今日行动计划
        </label>
        <textarea
          value={actionPlan}
          onChange={(e) => setActionPlan(e.target.value)}
          placeholder="例如：给一位老朋友发条问候短信，表达我对友谊的重视..."
          className="w-full h-32 p-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 resize-none focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all duration-300"
        />
        <div className="flex justify-between text-xs text-white/50">
          <span>{actionPlan.length} 字符</span>
          <span>{actionPlan.trim().length > 10 ? '✓ 可以继续' : '请输入至少10个字符'}</span>
        </div>
      </div>

      {/* 行动建议 */}
      <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg p-4 border border-yellow-400/20">
        <h4 className="text-yellow-300 font-medium mb-2">💡 行动建议</h4>
        <ul className="text-white/70 text-sm space-y-1">
          <li>• 选择一个小而具体的行动</li>
          <li>• 确保今天就能完成</li>
          <li>• 与你的核心价值观保持一致</li>
          <li>• 专注于过程而非结果</li>
        </ul>
      </div>
    </div>
  )

  const renderCommitPhase = () => (
    <div className="space-y-6 text-center">
      <div className="text-6xl mb-4">✨</div>
      <h2 className="text-3xl font-bold text-white mb-2">承诺与行动</h2>
      <p className="text-white/80 text-lg mb-8">
        你已经完成了价值观探索和行动规划！
      </p>

      {/* 总结卡片 */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-400/30 text-left">
        <h3 className="text-white font-bold text-lg mb-4">你的价值罗盘</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-purple-300 font-medium mb-2">核心价值观</h4>
            <p className="text-white/80 text-sm">{selectedValuesText}</p>
          </div>
          
          <div>
            <h4 className="text-purple-300 font-medium mb-2">今日行动</h4>
            <p className="text-white/80 text-sm">{actionPlan}</p>
          </div>
        </div>
      </div>

      {/* 激励语句 */}
      <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-4 border border-green-400/20">
        <p className="text-white/90 text-sm leading-relaxed">
          🌟 记住：价值观是指引我们前进的北极星。当我们按照价值观行动时，
          即使面临困难，我们也能感受到生活的意义和满足感。
        </p>
      </div>
    </div>
  )

  const canProceed = () => {
    if (currentPhase === 'explore') {
      return selectedValuesCount > 0
    }
    if (currentPhase === 'action') {
      return actionPlan.trim().length > 10
    }
    return true
  }

  const getPhaseTitle = () => {
    switch (currentPhase) {
      case 'explore': return '1/3 探索价值观'
      case 'action': return '2/3 制定行动'
      case 'commit': return '3/3 承诺行动'
      default: return ''
    }
  }

  const aiInput = useMemo(() => {
    if (currentPhase === 'explore') {
      return selectedValuesText
    }

    if (currentPhase === 'action') {
      return actionPlan.trim()
    }

    return `核心价值观：${selectedValuesText}。今日行动：${actionPlan.trim()}`
  }, [actionPlan, currentPhase, selectedValuesText])

  const canRequestAIFeedback = useMemo(() => {
    if (currentPhase === 'explore') {
      return selectedValuesCount > 0
    }

    if (currentPhase === 'action') {
      return actionPlan.trim().length > 10
    }

    return selectedValuesCount > 0 && actionPlan.trim().length > 10
  }, [actionPlan, currentPhase, selectedValuesCount])

  useEffect(() => {
    if (!canRequestAIFeedback) {
      setAiLoading(false)
      setAiFeedback(null)
      setAiError('')
      return
    }

    const requestId = aiRequestRef.current + 1
    aiRequestRef.current = requestId
    const controller = new AbortController()

    const timerId = window.setTimeout(async () => {
      try {
        setAiLoading(true)
        setAiError('')

        const result = await requestDailyJourneyFeedback({
          activityType: 'value_compass',
          stepId: currentPhase,
          userInput: aiInput,
          context: {
            phase: currentPhase,
            selectedValuesCount,
            selectedValuesText: selectedValuesText.slice(0, 200),
          },
        }, { signal: controller.signal })

        if (aiRequestRef.current !== requestId) {
          return
        }

        setAiFeedback(result?.feedback ?? null)
      } catch (error) {
        if (aiRequestRef.current !== requestId) {
          return
        }

        if (error instanceof Error && error.name === 'AbortError') {
          return
        }

        setAiError(error instanceof Error ? error.message : 'AI 反馈暂时不可用')
      } finally {
        if (aiRequestRef.current === requestId) {
          setAiLoading(false)
        }
      }
    }, 700)

    return () => {
      window.clearTimeout(timerId)
      controller.abort()
    }
  }, [aiInput, canRequestAIFeedback, currentPhase, selectedValuesCount, selectedValuesText])

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      {/* 背景粒子效果 */}
      <OptimizedParticleBackground color="#A855F7" quantity={10} />
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between p-6">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
          >
            <span className="text-2xl">←</span>
            <span>返回</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">价值罗盘</h1>
            <p className="text-white/70">ACT价值观探索</p>
          </div>
          
          <div className="text-white/80 text-right">
            <div className="text-sm">阶段</div>
            <div className="text-lg font-mono">{getPhaseTitle()}</div>
          </div>
        </div>

        {/* 进度条 */}
        <div className="px-6 mb-6">
          <div className="w-full bg-white/20 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-purple-400 to-pink-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(currentPhase === 'explore' ? 33 : currentPhase === 'action' ? 66 : 100)}%` }}
            ></div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="flex-1 px-6 pb-24 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            {currentPhase === 'explore' && renderExplorePhase()}
            {currentPhase === 'action' && renderActionPhase()}
            {currentPhase === 'commit' && renderCommitPhase()}

            <div className="mt-6">
              <AIFeedbackPanel
                loading={aiLoading}
                error={aiError}
                feedback={aiFeedback}
                accent="violet"
              />
            </div>
          </div>
        </div>

        {/* 底部控制按钮 */}
        <div className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-t border-purple-400/20">
          <div className="flex justify-between max-w-2xl mx-auto">
            <button
              onClick={handlePhasePrevious}
              disabled={currentPhase === 'explore'}
              className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一步
            </button>
            
            <button
              onClick={handlePhaseNext}
              disabled={!canProceed()}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentPhase === 'commit' ? '完成练习' : '下一步'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ValueCompass
