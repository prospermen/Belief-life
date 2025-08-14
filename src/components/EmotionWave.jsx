import { useState, useEffect } from 'react'
import OptimizedParticleBackground from './OptimizedParticleBackground'

const EmotionWave = ({ onComplete, onBack }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [waveIntensity, setWaveIntensity] = useState(0.5)
  const [isInteracting, setIsInteracting] = useState(false)
  const [completedSteps, setCompletedSteps] = useState(new Set())

  const steps = [
    {
      title: "观察你的感受",
      instruction: "注意到此刻内心的感受，不要试图改变它，只是观察。",
      detail: "想象你的情绪就像海洋中的波浪，有高有低，这是完全自然的。",
      action: "点击并拖动屏幕，感受情绪的波动"
    },
    {
      title: "接纳这个感受",
      instruction: "告诉自己：'这个感受是可以的，我允许它存在。'",
      detail: "不要与情绪对抗，就像冲浪者不会与海浪对抗一样。",
      action: "继续与波浪互动，让它自然流动"
    },
    {
      title: "与感受共存",
      instruction: "想象自己是一个熟练的冲浪者，在情绪的波浪上保持平衡。",
      detail: "你不需要控制波浪，只需要学会与它们和谐共处。",
      action: "感受自己在情绪波浪上的平衡"
    },
    {
      title: "观察变化",
      instruction: "注意到情绪的强度在自然地变化，就像波浪有起有落。",
      detail: "强烈的情绪不会永远持续，它们会自然地减弱和消散。",
      action: "观察波浪的自然变化"
    },
    {
      title: "感受平静",
      instruction: "现在，感受内心深处的那份平静，它一直都在那里。",
      detail: "就像海洋深处总是平静的，你的内心也有一个平静的核心。",
      action: "让波浪逐渐平息，感受内在的宁静"
    }
  ]

  const handleWaveInteraction = (e) => {
    if (!isInteracting) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const intensity = Math.min(Math.max((rect.height - y) / rect.height, 0.1), 1)
    
    setWaveIntensity(intensity)
  }

  const handleStepComplete = () => {
    const newCompleted = new Set(completedSteps)
    newCompleted.add(currentStep)
    setCompletedSteps(newCompleted)
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      setIsInteracting(false)
    }
  }

  const startInteraction = () => {
    setIsInteracting(true)
    setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setIsInteracting(false)
      }
    }, 8000) // 8秒后自动进入下一步
  }

  useEffect(() => {
    // 自动减少波浪强度，模拟情绪的自然消散
    const interval = setInterval(() => {
      if (!isInteracting && waveIntensity > 0.2) {
        setWaveIntensity(prev => Math.max(prev - 0.01, 0.2))
      }
    }, 100)
    
    return () => clearInterval(interval)
  }, [isInteracting, waveIntensity])

  const currentStepData = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900">
      {/* 背景粒子效果 */}
      <OptimizedParticleBackground color="#3B82F6" quantity={12} />
      
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
            <h1 className="text-2xl font-bold text-white">感受的浪潮</h1>
            <p className="text-white/70">正念情绪练习</p>
          </div>
          
          <div className="text-white/80 text-right">
            <div className="text-sm">进度</div>
            <div className="text-lg font-mono">{Math.round(progress)}%</div>
          </div>
        </div>

        {/* 进度条 */}
        <div className="px-6 mb-4">
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          {/* 情绪波浪可视化 */}
          <div 
            className="relative w-full max-w-md h-80 mb-8 cursor-pointer"
            onMouseMove={handleWaveInteraction}
            onTouchMove={(e) => {
              e.preventDefault()
              handleWaveInteraction(e.touches[0])
            }}
          >
            {/* 波浪容器 */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden bg-gradient-to-b from-blue-400/20 to-blue-600/40 border border-blue-400/30">
              {/* 动态波浪 */}
              <div 
                className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500/60 to-blue-300/40 transition-all duration-300"
                style={{ 
                  height: `${waveIntensity * 100}%`,
                  clipPath: `polygon(0 ${20 + Math.sin(Date.now() / 1000) * 10}%, 25% ${15 + Math.cos(Date.now() / 800) * 8}%, 50% ${25 + Math.sin(Date.now() / 600) * 12}%, 75% ${18 + Math.cos(Date.now() / 900) * 6}%, 100% ${22 + Math.sin(Date.now() / 700) * 9}%, 100% 100%, 0 100%)`
                }}
              >
                {/* 波浪光效 */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20"></div>
              </div>
              
              {/* 冲浪者图标 */}
              <div 
                className="absolute text-4xl transition-all duration-300"
                style={{
                  left: '50%',
                  top: `${100 - waveIntensity * 80}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                🏄‍♀️
              </div>
            </div>
            
            {/* 交互提示 */}
            {!isInteracting && currentStep < 3 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
                <button
                  onClick={startInteraction}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-400 hover:to-purple-500 transition-all duration-300"
                >
                  开始互动
                </button>
              </div>
            )}
          </div>

          {/* 指导内容 */}
          <div className="text-center max-w-lg mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              {currentStepData.title}
            </h2>
            <p className="text-white/90 text-lg mb-3">
              {currentStepData.instruction}
            </p>
            <p className="text-white/70 text-sm mb-4">
              {currentStepData.detail}
            </p>
            <p className="text-blue-300 text-sm italic">
              {currentStepData.action}
            </p>
          </div>

          {/* 控制按钮 */}
          <div className="flex space-x-4">
            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleStepComplete}
                disabled={isInteracting}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-400 hover:to-purple-500 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一步
              </button>
            ) : (
              <button
                onClick={() => onComplete()}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-400 hover:to-green-500 transition-all duration-300 shadow-lg"
              >
                完成练习
              </button>
            )}
          </div>
        </div>

        {/* 底部提示 */}
        <div className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-t border-blue-400/20">
          <div className="text-center">
            <p className="text-white/70 text-sm">
              记住：情绪就像波浪，它们会来也会走。你只需要学会与它们和谐共处。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmotionWave

