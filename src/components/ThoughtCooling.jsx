import { useState } from 'react'
import OptimizedParticleBackground from './OptimizedParticleBackground'

const ThoughtCooling = ({ onComplete, onBack }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [responses, setResponses] = useState({
    identify: '',
    challenge: '',
    reframe: ''
  })

  const steps = [
    {
      id: 'identify',
      title: '第一步：识别想法',
      question: '写下此刻最让你痛苦的想法',
      placeholder: '例如：我永远不会成功...',
      instruction: '诚实地写下你脑海中最困扰你的想法，不要评判它，只是记录下来。',
      icon: '🔍',
      color: 'from-red-500 to-orange-500'
    },
    {
      id: 'challenge',
      title: '第二步：动摇想法',
      question: '这个想法100%是事实吗？有没有其他可能性？',
      placeholder: '例如：也许这只是我现在的感受，不代表永远...',
      instruction: '质疑这个想法的绝对性。寻找证据，考虑其他角度和可能性。',
      icon: '❓',
      color: 'from-orange-500 to-yellow-500'
    },
    {
      id: 'reframe',
      title: '第三步：重构想法',
      question: '如果一个朋友遇到同样情况，你会对他说什么？',
      placeholder: '例如：每个人都会遇到挫折，这是成长的一部分...',
      instruction: '用对待好朋友的温暖和理解来对待自己。提供支持和鼓励的话语。',
      icon: '💝',
      color: 'from-yellow-500 to-green-500'
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

  const canProceed = responses[currentStepData.id]?.trim().length > 10

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      {/* 背景粒子效果 */}
      <OptimizedParticleBackground color="#8B5CF6" quantity={10} />
      
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
            <h1 className="text-2xl font-bold text-white">思维降温</h1>
            <p className="text-white/70">三步法重构想法</p>
          </div>
          
          <div className="text-white/80 text-right">
            <div className="text-sm">步骤</div>
            <div className="text-lg font-mono">{currentStep + 1}/3</div>
          </div>
        </div>

        {/* 进度条 */}
        <div className="px-6 mb-6">
          <div className="w-full bg-white/20 rounded-full h-3">
            <div 
              className={`bg-gradient-to-r ${currentStepData.color} h-3 rounded-full transition-all duration-500`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-white/60">
            <span>识别</span>
            <span>动摇</span>
            <span>重构</span>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          {/* 步骤卡片 */}
          <div className="w-full max-w-2xl">
            <div className={`bg-gradient-to-br ${currentStepData.color} p-1 rounded-2xl mb-8`}>
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

                {/* 指导说明 */}
                <div className="bg-white/5 rounded-lg p-4 mb-6">
                  <p className="text-white/70 text-sm leading-relaxed">
                    {currentStepData.instruction}
                  </p>
                </div>

                {/* 输入区域 */}
                <div className="mb-6">
                  <textarea
                    value={responses[currentStepData.id]}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder={currentStepData.placeholder}
                    className="w-full h-32 p-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 resize-none focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all duration-300"
                    style={{ minHeight: '120px' }}
                  />
                  <div className="flex justify-between mt-2 text-xs text-white/50">
                    <span>
                      {responses[currentStepData.id]?.length || 0} 字符
                    </span>
                    <span>
                      {canProceed ? '✓ 可以继续' : '至少输入10个字符'}
                    </span>
                  </div>
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
                    disabled={!canProceed}
                    className={`px-8 py-3 bg-gradient-to-r ${currentStepData.color} text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {currentStep === steps.length - 1 ? '完成练习' : '下一步'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 已完成步骤的预览 */}
          {currentStep > 0 && (
            <div className="w-full max-w-2xl">
              <h3 className="text-white/80 text-lg mb-4">你的回答回顾：</h3>
              <div className="space-y-3">
                {steps.slice(0, currentStep).map((step, index) => (
                  <div key={step.id} className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">{step.icon}</span>
                      <span className="text-white/80 text-sm font-medium">
                        {step.title}
                      </span>
                    </div>
                    <p className="text-white/70 text-sm line-clamp-2">
                      {responses[step.id]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 底部提示 */}
        <div className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-t border-purple-400/20">
          <div className="text-center">
            <p className="text-white/70 text-sm">
              💡 记住：想法不等于事实。通过质疑和重构，我们可以改变与想法的关系。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ThoughtCooling

