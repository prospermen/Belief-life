import { useState, useEffect } from 'react'
import OptimizedParticleBackground from './OptimizedParticleBackground'

const ThinkingGames = ({ onComplete, onBack }) => {
  const [selectedGame, setSelectedGame] = useState(null)
  const [gameState, setGameState] = useState({})
  const [completedGames, setCompletedGames] = useState(new Set())

  // 思维游戏配置
  const games = [
    {
      id: 'bubble',
      title: '思维泡泡',
      description: '将负面想法装进泡泡，看着它们飘走',
      icon: '🫧',
      color: 'from-blue-400 to-cyan-500',
      duration: '2-3分钟'
    },
    {
      id: 'train',
      title: '思维列车',
      description: '作为月台观察者，看着想法列车驶过',
      icon: '🚂',
      color: 'from-green-400 to-teal-500',
      duration: '3-4分钟'
    },
    {
      id: 'gratitude',
      title: '感谢大脑',
      description: '对产生的想法表达感谢和理解',
      icon: '🧠',
      color: 'from-purple-400 to-pink-500',
      duration: '1-2分钟'
    },
    {
      id: 'voice',
      title: '滑稽声音',
      description: '用有趣的声音重新"演绎"负面想法',
      icon: '🎭',
      color: 'from-orange-400 to-red-500',
      duration: '2-3分钟'
    },
    {
      id: 'leaves',
      title: '溪流叶子',
      description: '想象想法是飘在溪流上的叶子',
      icon: '🍃',
      color: 'from-green-500 to-emerald-500',
      duration: '4-5分钟'
    }
  ]

  const handleGameComplete = (gameId) => {
    setCompletedGames(prev => new Set([...prev, gameId]))
    setSelectedGame(null)
    setGameState({})
    
    // 如果完成了所有游戏，结束练习
    if (completedGames.size + 1 >= games.length) {
      setTimeout(() => onComplete(), 1000)
    }
  }

  const renderGameSelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🎮</div>
        <h2 className="text-3xl font-bold text-white mb-2">选择思维游戏</h2>
        <p className="text-white/80 text-lg mb-4">
          通过游戏化练习，学会与想法拉开距离
        </p>
        <div className="text-white/60 text-sm">
          已完成 {completedGames.size}/{games.length} 个游戏
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {games.map(game => {
          const isCompleted = completedGames.has(game.id)
          
          return (
            <button
              key={game.id}
              onClick={() => !isCompleted && setSelectedGame(game.id)}
              disabled={isCompleted}
              className={`p-6 rounded-2xl border transition-all duration-300 text-left relative ${
                isCompleted
                  ? 'bg-green-500/20 border-green-400/30 cursor-default'
                  : `bg-gradient-to-r ${game.color} bg-opacity-20 border-white/20 hover:border-white/40 hover:scale-105 cursor-pointer`
              }`}
            >
              {isCompleted && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm">✓</span>
                </div>
              )}
              
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center shadow-lg`}>
                  <span className="text-3xl">{game.icon}</span>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg mb-1">
                    {game.title}
                  </h3>
                  <p className="text-white/80 text-sm mb-2">
                    {game.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-xs">
                      ⏱ {game.duration}
                    </span>
                    {isCompleted ? (
                      <span className="text-green-400 text-xs font-medium">
                        已完成
                      </span>
                    ) : (
                      <span className="text-white/40 text-xs">
                        点击开始 →
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {completedGames.size === games.length && (
        <div className="mt-8 bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-sm rounded-2xl p-6 border border-green-400/30 text-center">
          <div className="text-4xl mb-3">🎉</div>
          <h3 className="text-white font-bold text-lg mb-2">
            所有游戏完成！
          </h3>
          <p className="text-white/80 text-sm">
            恭喜你体验了所有的思维游戏。记住，想法只是想法，不是事实。
          </p>
        </div>
      )}
    </div>
  )

  const renderBubbleGame = () => {
    const [thought, setThought] = useState('')
    const [bubbles, setBubbles] = useState([])
    const [showInput, setShowInput] = useState(true)

    const createBubble = () => {
      if (thought.trim()) {
        const newBubble = {
          id: Date.now(),
          text: thought.trim(),
          x: Math.random() * 60 + 20, // 20-80% 的位置
          y: 100,
          opacity: 1
        }
        setBubbles(prev => [...prev, newBubble])
        setThought('')
        setShowInput(false)
        
        // 动画效果
        setTimeout(() => {
          setBubbles(prev => prev.map(bubble => 
            bubble.id === newBubble.id 
              ? { ...bubble, y: -20, opacity: 0 }
              : bubble
          ))
        }, 100)
        
        // 清理泡泡
        setTimeout(() => {
          setBubbles(prev => prev.filter(bubble => bubble.id !== newBubble.id))
          setShowInput(true)
        }, 3000)
      }
    }

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🫧</div>
          <h2 className="text-3xl font-bold text-white mb-2">思维泡泡</h2>
          <p className="text-white/80 text-lg">
            将你的想法装进泡泡，看着它们轻盈地飘走
          </p>
        </div>

        {/* 泡泡动画区域 */}
        <div className="relative h-80 bg-gradient-to-b from-blue-500/10 to-cyan-500/10 rounded-2xl border border-blue-400/20 overflow-hidden">
          {bubbles.map(bubble => (
            <div
              key={bubble.id}
              className="absolute transition-all duration-3000 ease-out"
              style={{
                left: `${bubble.x}%`,
                bottom: `${bubble.y}%`,
                opacity: bubble.opacity,
                transform: 'translateX(-50%)'
              }}
            >
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 rounded-full border border-blue-300/50 flex items-center justify-center backdrop-blur-sm">
                  <span className="text-white/80 text-xs text-center px-2 leading-tight">
                    {bubble.text.length > 20 ? bubble.text.substring(0, 20) + '...' : bubble.text}
                  </span>
                </div>
                <div className="absolute inset-0 w-24 h-24 rounded-full bg-gradient-to-tr from-white/20 to-transparent"></div>
              </div>
            </div>
          ))}
        </div>

        {/* 输入区域 */}
        {showInput && (
          <div className="space-y-4">
            <label className="block text-white font-medium">
              输入一个困扰你的想法：
            </label>
            <div className="flex space-x-3">
              <input
                type="text"
                value={thought}
                onChange={(e) => setThought(e.target.value)}
                placeholder="例如：我永远不会成功..."
                className="flex-1 p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all duration-300"
                onKeyPress={(e) => e.key === 'Enter' && createBubble()}
              />
              <button
                onClick={createBubble}
                disabled={!thought.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                制造泡泡
              </button>
            </div>
          </div>
        )}

        {!showInput && (
          <div className="text-center">
            <p className="text-white/80 text-sm mb-4">
              看着你的想法慢慢飘走...想法来了又走，这是很自然的。
            </p>
            <button
              onClick={() => setShowInput(true)}
              className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300"
            >
              继续添加想法
            </button>
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={() => handleGameComplete('bubble')}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
          >
            完成游戏
          </button>
        </div>
      </div>
    )
  }

  const renderTrainGame = () => {
    const [thoughts, setThoughts] = useState([])
    const [currentThought, setCurrentThought] = useState('')
    const [isObserving, setIsObserving] = useState(false)

    const addThought = () => {
      if (currentThought.trim()) {
        const newThought = {
          id: Date.now(),
          text: currentThought.trim(),
          position: 120 // 从右侧开始
        }
        setThoughts(prev => [...prev, newThought])
        setCurrentThought('')
        
        // 动画移动火车
        const moveInterval = setInterval(() => {
          setThoughts(prev => prev.map(thought => 
            thought.id === newThought.id 
              ? { ...thought, position: thought.position - 2 }
              : thought
          ))
        }, 50)
        
        // 清理离开屏幕的火车
        setTimeout(() => {
          clearInterval(moveInterval)
          setThoughts(prev => prev.filter(thought => thought.id !== newThought.id))
        }, 8000)
      }
    }

    const startObserving = () => {
      setIsObserving(true)
      // 自动添加一些示例想法
      const exampleThoughts = [
        "我不够好",
        "别人会怎么看我",
        "我应该更努力",
        "我又搞砸了",
        "我很焦虑"
      ]
      
      exampleThoughts.forEach((thought, index) => {
        setTimeout(() => {
          setCurrentThought(thought)
          setTimeout(() => addThought(), 100)
        }, index * 2000)
      })
      
      setTimeout(() => {
        setIsObserving(false)
      }, 12000)
    }

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🚂</div>
          <h2 className="text-3xl font-bold text-white mb-2">思维列车</h2>
          <p className="text-white/80 text-lg">
            你是月台上的观察者，看着想法列车从面前驶过
          </p>
        </div>

        {/* 火车轨道动画区域 */}
        <div className="relative h-60 bg-gradient-to-b from-gray-800/20 to-gray-900/20 rounded-2xl border border-gray-400/20 overflow-hidden">
          {/* 铁轨 */}
          <div className="absolute bottom-16 w-full h-2 bg-gradient-to-r from-gray-600 to-gray-500 opacity-60"></div>
          <div className="absolute bottom-14 w-full h-1 bg-gradient-to-r from-gray-500 to-gray-400 opacity-40"></div>
          
          {/* 月台观察者 */}
          <div className="absolute bottom-8 left-8">
            <div className="text-4xl">🧍‍♀️</div>
            <div className="text-white/60 text-xs text-center">观察者</div>
          </div>
          
          {/* 思维火车 */}
          {thoughts.map(thought => (
            <div
              key={thought.id}
              className="absolute bottom-20 transition-all duration-100 ease-linear"
              style={{ right: `${thought.position}%` }}
            >
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-3 shadow-lg min-w-32 max-w-48">
                  <div className="text-white text-sm font-medium text-center">
                    {thought.text}
                  </div>
                </div>
                <div className="text-3xl ml-2">🚂</div>
              </div>
            </div>
          ))}
        </div>

        {/* 控制区域 */}
        {!isObserving ? (
          <div className="space-y-4">
            <div className="flex space-x-3">
              <input
                type="text"
                value={currentThought}
                onChange={(e) => setCurrentThought(e.target.value)}
                placeholder="输入一个想法，让它成为火车..."
                className="flex-1 p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all duration-300"
                onKeyPress={(e) => e.key === 'Enter' && addThought()}
              />
              <button
                onClick={addThought}
                disabled={!currentThought.trim()}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                发车
              </button>
            </div>
            
            <div className="text-center">
              <button
                onClick={startObserving}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
              >
                开始观察练习
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-white/80 text-sm mb-4">
              保持观察者的角色，不要跳上任何一列火车。让想法自然地驶过...
            </p>
            <div className="text-white/60 text-xs">
              观察练习进行中...
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={() => handleGameComplete('train')}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
          >
            完成游戏
          </button>
        </div>
      </div>
    )
  }

  const renderSimpleGame = (gameId, title, icon, content, actionText) => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">{icon}</div>
        <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
        <p className="text-white/80 text-lg">
          {content}
        </p>
      </div>

      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-400/30">
        <div className="text-center">
          <p className="text-white/90 text-lg leading-relaxed mb-6">
            {actionText}
          </p>
          <button
            onClick={() => handleGameComplete(gameId)}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
          >
            我已经尝试了
          </button>
        </div>
      </div>
    </div>
  )

  // 根据选中的游戏渲染不同内容
  if (selectedGame === 'bubble') {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900">
        <OptimizedParticleBackground color="#06B6D4" quantity={8} />
        <div className="relative z-10 min-h-screen flex flex-col">
          <div className="flex items-center justify-between p-6">
            <button
              onClick={() => setSelectedGame(null)}
              className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
            >
              <span className="text-2xl">←</span>
              <span>返回</span>
            </button>
          </div>
          <div className="flex-1 px-6 pb-24">
            <div className="max-w-2xl mx-auto">
              {renderBubbleGame()}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (selectedGame === 'train') {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-900 via-green-900 to-slate-900">
        <OptimizedParticleBackground color="#10B981" quantity={8} />
        <div className="relative z-10 min-h-screen flex flex-col">
          <div className="flex items-center justify-between p-6">
            <button
              onClick={() => setSelectedGame(null)}
              className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
            >
              <span className="text-2xl">←</span>
              <span>返回</span>
            </button>
          </div>
          <div className="flex-1 px-6 pb-24">
            <div className="max-w-2xl mx-auto">
              {renderTrainGame()}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (selectedGame === 'gratitude') {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
        <OptimizedParticleBackground color="#A855F7" quantity={8} />
        <div className="relative z-10 min-h-screen flex flex-col">
          <div className="flex items-center justify-between p-6">
            <button
              onClick={() => setSelectedGame(null)}
              className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
            >
              <span className="text-2xl">←</span>
              <span>返回</span>
            </button>
          </div>
          <div className="flex-1 px-6 pb-24">
            <div className="max-w-2xl mx-auto">
              {renderSimpleGame(
                'gratitude',
                '感谢大脑',
                '🧠',
                '学会对大脑产生的想法表达感谢',
                '当负面想法出现时，试着说："谢谢你，我的大脑，又产生了这么有趣的想法。你在努力保护我，虽然这次可能不太准确。"'
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (selectedGame === 'voice') {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-900 via-orange-900 to-slate-900">
        <OptimizedParticleBackground color="#F97316" quantity={8} />
        <div className="relative z-10 min-h-screen flex flex-col">
          <div className="flex items-center justify-between p-6">
            <button
              onClick={() => setSelectedGame(null)}
              className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
            >
              <span className="text-2xl">←</span>
              <span>返回</span>
            </button>
          </div>
          <div className="flex-1 px-6 pb-24">
            <div className="max-w-2xl mx-auto">
              {renderSimpleGame(
                'voice',
                '滑稽声音',
                '🎭',
                '用有趣的声音重新演绎负面想法',
                '想象用卡通角色的声音（比如唐老鸭、米老鼠）来"说出"你的负面想法。这样可以降低想法的严肃性和威胁感。'
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (selectedGame === 'leaves') {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-900 via-emerald-900 to-slate-900">
        <OptimizedParticleBackground color="#10B981" quantity={8} />
        <div className="relative z-10 min-h-screen flex flex-col">
          <div className="flex items-center justify-between p-6">
            <button
              onClick={() => setSelectedGame(null)}
              className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
            >
              <span className="text-2xl">←</span>
              <span>返回</span>
            </button>
          </div>
          <div className="flex-1 px-6 pb-24">
            <div className="max-w-2xl mx-auto">
              {renderSimpleGame(
                'leaves',
                '溪流叶子',
                '🍃',
                '想象想法是飘在溪流上的叶子',
                '闭上眼睛，想象自己坐在小溪边。每当有想法出现时，就把它放在一片叶子上，看着叶子顺着溪流慢慢飘走。不要试图阻止或加速，只是观察。'
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 主游戏选择界面
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-900 to-slate-900">
      <OptimizedParticleBackground color="#6366F1" quantity={10} />
      
      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="flex items-center justify-between p-6">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
          >
            <span className="text-2xl">←</span>
            <span>返回</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">思维游戏</h1>
            <p className="text-white/70">ACT认知解离练习</p>
          </div>
          
          <div className="w-16"></div>
        </div>

        <div className="flex-1 px-6 pb-24">
          <div className="max-w-2xl mx-auto">
            {renderGameSelection()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ThinkingGames

