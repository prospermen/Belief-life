import { useState, useEffect } from 'react'
import OptimizedParticleBackground from './OptimizedParticleBackground'

const PHASES = ['inhale', 'hold', 'exhale', 'pause']
const BREATHING_PATTERN = {
  inhale: 4,
  hold: 7,
  exhale: 8,
  pause: 2,
}

const BreathingExercise = ({ onComplete, onBack }) => {
  const [phase, setPhase] = useState('inhale') // inhale, hold, exhale, pause
  const [count, setCount] = useState(4)
  const [cycle, setCycle] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [totalTime] = useState(180)
  const [remainingTime, setRemainingTime] = useState(180)

  const phaseTexts = {
    inhale: '吸气',
    hold: '屏息',
    exhale: '呼气',
    pause: '暂停'
  }

  const phaseInstructions = {
    inhale: '缓慢深吸气，让腹部自然扩张',
    hold: '轻松屏住呼吸，保持平静',
    exhale: '缓慢呼气，释放所有紧张',
    pause: '自然暂停，感受内心的平静'
  }

  useEffect(() => {
    let interval = null
    if (isActive && remainingTime > 0) {
      interval = setInterval(() => {
        setCount(count => {
          if (count <= 1) {
            // 切换到下一个阶段
            setPhase(currentPhase => {
              const currentIndex = PHASES.indexOf(currentPhase)
              const nextIndex = (currentIndex + 1) % PHASES.length
              const nextPhase = PHASES[nextIndex]
              
              if (nextPhase === 'inhale') {
                setCycle(c => c + 1)
              }
              
              return nextPhase
            })
            const currentIndex = PHASES.indexOf(phase)
            const nextIndex = (currentIndex + 1) % PHASES.length
            const nextPhase = PHASES[nextIndex]
            return BREATHING_PATTERN[nextPhase]
          }
          return count - 1
        })
        
        setRemainingTime(time => time - 1)
      }, 1000)
    } else if (remainingTime === 0) {
      setIsActive(false)
      // 练习完成，可以选择进入感受浪潮练习
    }
    return () => clearInterval(interval)
  }, [isActive, phase, remainingTime])

  const startExercise = () => {
    setIsActive(true)
    setPhase('inhale')
    setCount(BREATHING_PATTERN.inhale)
    setCycle(0)
    setRemainingTime(totalTime)
  }

  const pauseExercise = () => {
    setIsActive(!isActive)
  }

  const resetExercise = () => {
    setIsActive(false)
    setPhase('inhale')
    setCount(BREATHING_PATTERN.inhale)
    setCycle(0)
    setRemainingTime(totalTime)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getCircleScale = () => {
    const progress = (BREATHING_PATTERN[phase] - count) / BREATHING_PATTERN[phase]
    if (phase === 'inhale') {
      return 0.5 + (progress * 0.5) // 从0.5放大到1.0
    } else if (phase === 'exhale') {
      return 1.0 - (progress * 0.5) // 从1.0缩小到0.5
    }
    return phase === 'hold' ? 1.0 : 0.5
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      {/* 背景粒子效果 */}
      <OptimizedParticleBackground color="#FACC15" quantity={15} />
      
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
            <h1 className="text-2xl font-bold text-white">呼吸练习</h1>
            <p className="text-white/70">4-7-8呼吸法</p>
          </div>
          
          <div className="text-white/80 text-right">
            <div className="text-sm">剩余时间</div>
            <div className="text-lg font-mono">{formatTime(remainingTime)}</div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          {/* 呼吸圆环 */}
          <div className="relative mb-8">
            <div 
              className="w-80 h-80 rounded-full border-4 border-yellow-400/60 flex items-center justify-center transition-all duration-1000 ease-in-out"
              style={{
                transform: `scale(${getCircleScale()})`,
                boxShadow: `0 0 60px rgba(250, 204, 21, ${isActive ? 0.6 : 0.3}), inset 0 0 60px rgba(250, 204, 21, 0.1)`,
                background: `radial-gradient(circle, rgba(250, 204, 21, 0.1) 0%, rgba(250, 204, 21, 0.05) 50%, transparent 100%)`
              }}
            >
              <div className="text-center">
                <div className="text-6xl font-bold text-yellow-400 mb-2">
                  {count}
                </div>
                <div className="text-2xl text-white font-semibold">
                  {phaseTexts[phase]}
                </div>
              </div>
            </div>
            
            {/* 装饰性符文 */}
            <div className="absolute -inset-8 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-4 h-4 text-yellow-400/40"
                  style={{
                    transform: `rotate(${i * 45}deg) translateY(-160px)`,
                    transformOrigin: '50% 160px'
                  }}
                >
                  ✦
                </div>
              ))}
            </div>
          </div>

          {/* 指导文字 */}
          <div className="text-center mb-8">
            <p className="text-white/90 text-lg mb-2">
              {phaseInstructions[phase]}
            </p>
            <p className="text-white/60 text-sm">
              第 {cycle + 1} 个循环
            </p>
          </div>

          {/* 控制按钮 */}
          <div className="flex space-x-4">
            {!isActive && remainingTime === totalTime ? (
              <button
                onClick={startExercise}
                className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold rounded-lg hover:from-yellow-300 hover:to-yellow-400 transition-all duration-300 shadow-lg"
              >
                开始练习
              </button>
            ) : (
              <>
                <button
                  onClick={pauseExercise}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-400 hover:to-blue-500 transition-all duration-300 shadow-lg"
                >
                  {isActive ? '暂停' : '继续'}
                </button>
                <button
                  onClick={resetExercise}
                  className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-lg hover:from-gray-400 hover:to-gray-500 transition-all duration-300 shadow-lg"
                >
                  重新开始
                </button>
              </>
            )}
          </div>
        </div>

        {/* 底部完成提示 */}
        {remainingTime === 0 && (
          <div className="p-6 bg-gradient-to-r from-green-500/20 to-blue-500/20 border-t border-green-400/30">
            <div className="text-center">
              <h3 className="text-white font-semibold text-lg mb-2">
                🎉 呼吸练习完成！
              </h3>
              <p className="text-white/80 mb-4">
                感觉如何？你可以继续尝试"感受的浪潮"练习，或者返回主页。
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => onComplete('wave')}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-400 hover:to-purple-500 transition-all duration-300"
                >
                  感受的浪潮
                </button>
                <button
                  onClick={() => onComplete('home')}
                  className="px-6 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-400 hover:to-gray-500 transition-all duration-300"
                >
                  返回主页
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BreathingExercise

