import { useState, useEffect } from 'react'
import OptimizedParticleBackground from './OptimizedParticleBackground'
import { recordGuidedExerciseSession } from '../lib/practiceHelpers'
import { BOTTOM_SAFE_PADDING } from '../lib/layoutConstants'

const ExercisePage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [completionNotice, setCompletionNotice] = useState('')

  // 练习数据
  const exercises = [
    {
      id: 1,
      title: '深度呼吸练习',
      category: 'breathing',
      duration: 300, // 5分钟
      description: '通过深度呼吸来放松身心，缓解压力和焦虑',
      icon: '🌬️',
      difficulty: '初级'
    },
    {
      id: 2,
      title: '正念冥想',
      category: 'meditation',
      duration: 600, // 10分钟
      description: '专注当下，观察内心的想法和感受',
      icon: '🧘‍♀️',
      difficulty: '中级'
    },
    {
      id: 3,
      title: '身体扫描',
      category: 'relaxation',
      duration: 900, // 15分钟
      description: '从头到脚放松身体的每一个部位',
      icon: '✨',
      difficulty: '初级'
    },
    {
      id: 4,
      title: '睡前冥想',
      category: 'sleep',
      duration: 720, // 12分钟
      description: '帮助您放松身心，进入深度睡眠',
      icon: '🌙',
      difficulty: '初级'
    },
    {
      id: 5,
      title: '焦虑缓解',
      category: 'relaxation',
      duration: 480, // 8分钟
      description: '专门针对焦虑情绪的放松练习',
      icon: '🕊️',
      difficulty: '中级'
    },
    {
      id: 6,
      title: '专注力训练',
      category: 'meditation',
      duration: 420, // 7分钟
      description: '提高注意力和专注力的冥想练习',
      icon: '🎯',
      difficulty: '高级'
    }
  ]

  const categories = [
    { id: 'all', name: '全部', icon: '🌟' },
    { id: 'breathing', name: '呼吸练习', icon: '🌬️' },
    { id: 'meditation', name: '冥想', icon: '🧘‍♀️' },
    { id: 'relaxation', name: '放松', icon: '✨' },
    { id: 'sleep', name: '睡眠', icon: '🌙' }
  ]

  // 筛选练习
  const filteredExercises = selectedCategory === 'all' 
    ? exercises 
    : exercises.filter(exercise => exercise.category === selectedCategory)

  // 格式化时间
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 模拟音频播放
  useEffect(() => {
    let interval
    if (isPlaying && selectedExercise) {
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 1
          setTimeRemaining(selectedExercise.duration - newProgress)
          
          if (newProgress >= selectedExercise.duration) {
            recordGuidedExerciseSession(selectedExercise)
            setCompletionNotice(`已记录：${selectedExercise.title}`)
            setIsPlaying(false)
            setProgress(0)
            setTimeRemaining(0)
            return 0
          }
          return newProgress
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, selectedExercise])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
    if (!isPlaying && progress === 0) {
      setTimeRemaining(selectedExercise.duration)
    }
  }

  const handleStop = () => {
    setIsPlaying(false)
    setProgress(0)
    setTimeRemaining(0)
  }

  const handleExerciseSelect = (exercise) => {
    setSelectedExercise(exercise)
    setIsPlaying(false)
    setProgress(0)
    setTimeRemaining(exercise.duration)
    setCompletionNotice('')
  }

  const handleBackToList = () => {
    setSelectedExercise(null)
    setIsPlaying(false)
    setProgress(0)
    setTimeRemaining(0)
    setCompletionNotice('')
  }

  if (selectedExercise) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* 背景 */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url("/src/assets/exercise-bg.webp")`,
            filter: 'brightness(0.7)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-purple-900/60 to-slate-900/80" />
        
        <OptimizedParticleBackground color="#FACC15" quantity={12} />

        <div className="relative z-10 min-h-screen flex flex-col">
          {/* 顶部导航 */}
          <div className="flex items-center justify-between p-6">
            <button
              onClick={handleBackToList}
              className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
            >
              <span className="text-xl">←</span>
              <span>返回</span>
            </button>
            <h1 className="text-xl font-bold text-white">{selectedExercise.title}</h1>
            <div className="w-16" />
          </div>

          {/* 主要内容区域 */}
          <div
            className="flex-1 flex flex-col items-center justify-center px-6 pb-24"
            style={{ paddingBottom: BOTTOM_SAFE_PADDING }}
          >
            {completionNotice && (
              <div className="w-full max-w-2xl mb-6 bg-green-500/15 border border-green-400/30 rounded-2xl px-4 py-3 text-center">
                <p className="text-green-200 text-sm">{completionNotice}，可在历史记录和智能洞察中查看。</p>
              </div>
            )}

            {/* 呼吸圆环 */}
            <div className="relative mb-8">
              <div 
                className={`w-48 h-48 rounded-full border-4 border-yellow-400/60 flex items-center justify-center transition-all duration-1000 ${
                  isPlaying ? 'scale-110 shadow-lg shadow-yellow-400/30' : 'scale-100'
                }`}
                style={{
                  backgroundImage: `url('/src/assets/breathing-circle.png')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className={`w-32 h-32 rounded-full bg-yellow-400/20 flex items-center justify-center transition-all duration-2000 ${
                  isPlaying ? 'scale-125' : 'scale-100'
                }`}>
                  <span className="text-4xl">{selectedExercise.icon}</span>
                </div>
              </div>
              
              {/* 进度环 */}
              {selectedExercise && (
                <svg className="absolute inset-0 w-48 h-48 -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="url(#gradient)"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 88}`}
                    strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / selectedExercise.duration)}`}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FFD700" />
                      <stop offset="100%" stopColor="#FFA500" />
                    </linearGradient>
                  </defs>
                </svg>
              )}
            </div>

            {/* 时间显示 */}
            <div className="text-center mb-8">
              <div className="text-4xl font-bold text-white mb-2">
                {formatTime(timeRemaining)}
              </div>
              <div className="text-white/60">
                剩余时间
              </div>
            </div>

            {/* 练习提示 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 max-w-sm text-center">
              <p className="text-white/90 leading-relaxed">
                {isPlaying ? (
                  selectedExercise.category === 'breathing' ? 
                    '深深吸气...慢慢呼气...让身心完全放松' :
                  selectedExercise.category === 'meditation' ?
                    '专注于当下这一刻，观察你的呼吸和感受' :
                  selectedExercise.category === 'relaxation' ?
                    '放松你的肌肉，释放所有的紧张和压力' :
                    '让思绪慢慢平静下来，准备进入安详的睡眠'
                ) : (
                  '点击播放按钮开始您的正念练习之旅'
                )}
              </p>
            </div>

            {/* 控制按钮 */}
            <div className="flex items-center space-x-6">
              <button
                onClick={handleStop}
                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300"
              >
                <span className="text-xl">⏹</span>
              </button>
              
              <button
                onClick={handlePlayPause}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <span className="text-2xl ml-1">
                  {isPlaying ? '⏸' : '▶'}
                </span>
              </button>
              
              <button
                onClick={() => {/* 收藏功能 */}}
                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300"
              >
                <span className="text-xl">♡</span>
              </button>
            </div>
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
          backgroundImage: `url("/src/assets/exercise-bg.webp")`,
          filter: 'brightness(0.8)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-purple-900/50 to-slate-900/70" />
      
      <OptimizedParticleBackground color="#FACC15" quantity={10} />

      <div className="relative z-10 min-h-screen">
        {/* 顶部标题 */}
        <div className="text-center pt-8 pb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            ✨ 引导练习
          </h1>
          <p className="text-white/70">
            选择适合您的正念练习，开启内心平静之旅
          </p>
        </div>

        {/* 今日推荐 */}
        <div className="px-6 mb-6">
          <div className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 backdrop-blur-sm rounded-2xl p-4 border border-yellow-400/30">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-yellow-400/30 flex items-center justify-center">
                <span className="text-xl">🌟</span>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold">今日推荐</h3>
                <p className="text-white/70 text-sm">深度呼吸练习 - 5分钟放松身心</p>
              </div>
              <button 
                onClick={() => handleExerciseSelect(exercises[0])}
                className="px-4 py-2 bg-yellow-400/30 rounded-lg text-white text-sm hover:bg-yellow-400/40 transition-colors"
              >
                开始
              </button>
            </div>
          </div>
        </div>

        {/* 分类筛选 */}
        <div className="px-6 mb-6">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-lg'
                    : 'bg-white/10 backdrop-blur-sm text-white/80 hover:bg-white/20'
                }`}
              >
                <span>{category.icon}</span>
                <span className="text-sm font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 练习列表 */}
        <div className="px-6 pb-24" style={{ paddingBottom: BOTTOM_SAFE_PADDING }}>
          <div className="grid gap-4">
            {filteredExercises.map((exercise) => (
              <div
                key={exercise.id}
                onClick={() => handleExerciseSelect(exercise)}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/20 hover:border-yellow-400/50 transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400/30 to-orange-400/30 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <span className="text-2xl">{exercise.icon}</span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-white font-semibold">{exercise.title}</h3>
                      <span className="text-xs px-2 py-1 bg-yellow-400/20 text-yellow-300 rounded-full">
                        {exercise.difficulty}
                      </span>
                    </div>
                    <p className="text-white/70 text-sm mb-2">{exercise.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-white/60">
                      <span>⏱ {formatTime(exercise.duration)}</span>
                      <span>🎯 {exercise.difficulty}</span>
                    </div>
                  </div>
                  
                  <div className="text-white/40 group-hover:text-yellow-400 transition-colors">
                    <span className="text-xl">▶</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExercisePage
