import { useState } from 'react'
import OptimizedParticleBackground from './OptimizedParticleBackground'

const ThinkingDetective = ({ onComplete, onBack }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [responses, setResponses] = useState({
    situation: '',
    emotion: 5,
    thought: '',
    trap: '',
    evidence: ''
  })

  const steps = [
    {
      id: 'situation',
      title: '发生了什么？',
      question: '描述一下当时的具体情况',
      placeholder: '例如：今天开会时，我的提案被否决了...',
      type: 'textarea',
      icon: '📝'
    },
    {
      id: 'emotion',
      title: '情绪强度如何？',
      question: '用1-10分评估你当时的情绪强度',
      placeholder: '1分=非常轻微，10分=极其强烈',
      type: 'slider',
      icon: '😔'
    },
    {
      id: 'thought',
      title: '热点想法是什么？',
      question: '当时脑海里闪过的第一个想法是什么？',
      placeholder: '例如：我真是个失败者，永远做不好任何事...',
      type: 'textarea',
      icon: '💭'
    },
    {
      id: 'trap',
      title: '思维陷阱识别',
      question: '这个想法符合哪种思维陷阱？',
      type: 'select',
      icon: '🕳️',
      options: [
        '全或无思维（非黑即白）',
        '过度概括（以偏概全）',
        '心理过滤（只看消极面）',
        '否定积极面',
        '妄下结论（读心术/算命师错误）',
        '夸大或缩小',
        '情绪化推理',
        '应该句式',
        '贴标签',
        '个人化（自我归因）'
      ]
    },
    {
      id: 'evidence',
      title: '寻找反驳证据',
      question: '有什么证据可以反驳这个想法？',
      placeholder: '例如：我之前也有成功的项目，这次只是一个提案被否决，不代表我整个人都失败...',
      type: 'textarea',
      icon: '🔍'
    }
  ]

  const currentStepData = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  const handleInputChange = (value) => {
    setResponses(prev => ({
      ...prev,
      [currentStepData.id]: value
    }))
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // 完成所有步骤
      onComplete(responses)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceed = () => {
    const currentValue = responses[currentStepData.id]
    if (currentStepData.type === 'textarea') {
      return currentValue && currentValue.trim().length > 5
    }
    if (currentStepData.type === 'select') {
      return currentValue && currentValue.trim().length > 0
    }
    if (currentStepData.type === 'slider') {
      return true // 滑块总是有默认值
    }
    return false
  }

  const renderInput = () => {
    const currentValue = responses[currentStepData.id]

    if (currentStepData.type === 'textarea') {
      return (
        <textarea
          value={currentValue}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={currentStepData.placeholder}
          className="w-full h-32 p-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 resize-none focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all duration-300"
        />
      )
    }

    if (currentStepData.type === 'slider') {
      return (
        <div className="space-y-4">
          <div className="flex justify-between text-white/70 text-sm">
            <span>1 (轻微)</span>
            <span className="text-white font-bold text-lg">{currentValue}</span>
            <span>10 (极强)</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={currentValue}
            onChange={(e) => handleInputChange(parseInt(e.target.value))}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-lg">
              <span className="text-2xl">
                {currentValue <= 3 ? '😌' : currentValue <= 6 ? '😟' : currentValue <= 8 ? '😰' : '😱'}
              </span>
              <span className="text-white/80">
                {currentValue <= 3 ? '轻微' : currentValue <= 6 ? '中等' : currentValue <= 8 ? '强烈' : '极强'}
              </span>
            </div>
          </div>
        </div>
      )
    }

    if (currentStepData.type === 'select') {
      return (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {currentStepData.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleInputChange(option)}
              className={`w-full p-3 text-left rounded-lg border transition-all duration-300 ${
                currentValue === option
                  ? 'bg-blue-500/30 border-blue-400 text-white'
                  : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:border-white/30'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  currentValue === option ? 'bg-blue-400 border-blue-400' : 'border-white/40'
                }`}></div>
                <span className="text-sm">{option}</span>
              </div>
            </button>
          ))}
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900">
      {/* 背景粒子效果 */}
      <OptimizedParticleBackground color="#3B82F6" quantity={10} />
      
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
            <h1 className="text-2xl font-bold text-white">思维侦探</h1>
            <p className="text-white/70">CBT认知行为分析</p>
          </div>
          
          <div className="text-white/80 text-right">
            <div className="text-sm">步骤</div>
            <div className="text-lg font-mono">{currentStep + 1}/{steps.length}</div>
          </div>
        </div>

        {/* 进度条 */}
        <div className="px-6 mb-6">
          <div className="w-full bg-white/20 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-400 to-cyan-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          {/* 步骤卡片 */}
          <div className="w-full max-w-2xl">
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-1 rounded-2xl mb-8">
              <div className="bg-slate-900/90 rounded-2xl p-8">
                {/* 步骤标题 */}
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">{currentStepData.icon}</div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {currentStepData.title}
                  </h2>
                  <p className="text-white/80 text-lg">
                    {currentStepData.question}
                  </p>
                </div>

                {/* 输入区域 */}
                <div className="mb-6">
                  {renderInput()}
                  {currentStepData.type === 'textarea' && (
                    <div className="flex justify-between mt-2 text-xs text-white/50">
                      <span>
                        {responses[currentStepData.id]?.length || 0} 字符
                      </span>
                      <span>
                        {canProceed() ? '✓ 可以继续' : '请输入至少5个字符'}
                      </span>
                    </div>
                  )}
                </div>

                {/* 控制按钮 */}
                <div className="flex justify-between">
                  <button
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    上一步
                  </button>
                  
                  <button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {currentStep === steps.length - 1 ? '完成分析' : '下一步'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部提示 */}
        <div className="p-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-t border-blue-400/20">
          <div className="text-center">
            <p className="text-white/70 text-sm">
              🔍 通过系统性分析，我们可以更好地理解和改变自动化思维模式
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </div>
  )
}

export default ThinkingDetective

