import { useEffect, useMemo, useRef, useState } from 'react'
import OptimizedParticleBackground from './OptimizedParticleBackground'
import AIFeedbackPanel from './AIFeedbackPanel'
import {
  savePracticeSession,
} from '../lib/practiceStorage'
import { BOTTOM_SAFE_PADDING } from '../lib/layoutConstants'
import { requestDailyJourneyFeedback } from '../lib/aiDailyFeedback'
import { buildAIFeedbackMetadata } from '../lib/practiceHelpers'
import {
  DEFAULT_THINKING_GAME_PROGRESS_ENTRY,
  clearThinkingGameProgress,
  createThinkingGameProgressState,
  getCompletedGamesFromProgress,
  getThinkingGameProgress,
  saveThinkingGameProgress,
} from '../lib/thinkingGameProgress'

const games = [
  { id: 'bubble', title: '思维泡泡', description: '将负面想法装进泡泡，看着它们飘走', icon: '🫧', color: 'from-blue-400 to-cyan-500', screen: 'from-slate-900 via-blue-900 to-slate-900', particle: '#06B6D4', duration: '2-3分钟' },
  { id: 'train', title: '思维列车', description: '作为月台观察者，看着想法列车驶过', icon: '🚂', color: 'from-green-400 to-teal-500', screen: 'from-slate-900 via-green-900 to-slate-900', particle: '#10B981', duration: '3-4分钟' },
  { id: 'gratitude', title: '感谢大脑', description: '对产生的想法表达感谢和理解', icon: '🧠', color: 'from-purple-400 to-pink-500', screen: 'from-slate-900 via-purple-900 to-slate-900', particle: '#A855F7', duration: '1-2分钟' },
  { id: 'voice', title: '滑稽声音', description: '用有趣的声音重新“演绎”负面想法', icon: '🎭', color: 'from-orange-400 to-red-500', screen: 'from-slate-900 via-orange-900 to-slate-900', particle: '#F97316', duration: '2-3分钟' },
  { id: 'leaves', title: '溪流叶子', description: '想象想法是飘在溪流上的叶子', icon: '🍃', color: 'from-green-500 to-emerald-500', screen: 'from-slate-900 via-emerald-900 to-slate-900', particle: '#10B981', duration: '4-5分钟' },
]

const gratitudeTones = [
  { id: 'gentle', label: '温柔模式', icon: '💗', helper: '像朋友一样回应' },
  { id: 'coach', label: '教练模式', icon: '🧭', helper: '回到行动和目标' },
  { id: 'playful', label: '幽默模式', icon: '😄', helper: '轻轻松开想法' },
]

const voiceStyles = [
  { id: 'cartoon', label: '卡通配音', icon: '🐤' },
  { id: 'robot', label: '机器人播报', icon: '🤖' },
  { id: 'opera', label: '歌剧咏叹', icon: '🎼' },
  { id: 'host', label: '主持人口播', icon: '🎤' },
]

const initialState = () => ({
  bubbleThought: '',
  bubbles: [],
  bubbleCount: 0,
  trainThought: '',
  trains: [],
  trainCount: 0,
  observing: false,
  gratitudeThought: '',
  gratitudeTone: 'gentle',
  gratitudeResponse: '',
  voiceThought: '',
  voiceStyle: 'cartoon',
  voicePreview: '',
  voiceCount: 0,
  leafThought: '',
  leaves: [],
  leafCount: 0,
})

const levelConfig = [
  { id: 0, label: '新手', color: 'text-emerald-300' },
  { id: 1, label: '进阶', color: 'text-cyan-300' },
  { id: 2, label: '挑战', color: 'text-violet-300' },
]

const gameTargets = {
  bubble: { label: '放飞泡泡', goals: [1, 2, 3] },
  train: { label: '观察列车', goals: [1, 2, 4] },
  gratitude: { label: '生成回应', goals: [1, 1, 1] },
  voice: { label: '重新演绎', goals: [1, 2, 3] },
  leaves: { label: '放下叶子', goals: [1, 2, 4] },
}

const getGameMetricValue = (gameId, stateSnapshot) => {
  switch (gameId) {
    case 'bubble':
      return stateSnapshot.bubbleCount
    case 'train':
      return stateSnapshot.trainCount
    case 'gratitude':
      return stateSnapshot.gratitudeResponse.trim() ? 1 : 0
    case 'voice':
      return stateSnapshot.voiceCount
    case 'leaves':
      return stateSnapshot.leafCount
    default:
      return 0
  }
}

const getGameGoalForLevel = (gameId, level) => {
  const targetConfig = gameTargets[gameId]

  if (!targetConfig) {
    return 1
  }

  return targetConfig.goals[Math.min(level, targetConfig.goals.length - 1)] ?? 1
}

const getFeedbackFromState = (gameId, stateSnapshot) => {
  switch (gameId) {
    case 'bubble': {
      const lastBubble = stateSnapshot.bubbles.at(-1)
      return {
        summary: lastBubble ? `你刚刚把“${lastBubble.text}”放进了泡泡。` : '你刚刚练习了让想法出现又离开。',
        insight: '练习重点不是消灭想法，而是看见它来、允许它走。',
      }
    }
    case 'train': {
      const trainCount = stateSnapshot.trains.length
      return {
        summary: trainCount > 0 ? `你刚刚观察了 ${trainCount} 列想法列车。` : '你刚刚体验了站在月台上观察想法。',
        insight: '你可以是“观察者”，不必跳上每一列火车。',
      }
    }
    case 'gratitude': {
      const tone = gratitudeTones.find((item) => item.id === stateSnapshot.gratitudeTone)?.label ?? '当前模式'
      return {
        summary: stateSnapshot.gratitudeThought.trim()
          ? `你用${tone}回应了想法“${stateSnapshot.gratitudeThought.trim()}”。`
          : '你完成了一次感谢大脑练习。',
        insight: '当你停止和想法对打，行动空间反而会变大。',
      }
    }
    case 'voice': {
      const style = voiceStyles.find((item) => item.id === stateSnapshot.voiceStyle)?.label ?? '新的声音'
      return {
        summary: stateSnapshot.voiceThought.trim()
          ? `你用${style}重新演绎了“${stateSnapshot.voiceThought.trim()}”。`
          : '你尝试了用不同声音松动想法。',
        insight: '改变“说法”会降低想法的威胁感，让你更容易和它保持距离。',
      }
    }
    case 'leaves': {
      return {
        summary: `你放下了 ${stateSnapshot.leafCount} 片叶子，让想法顺流而下。`,
        insight: '你不需要把每个念头都抓在手里，允许流动也是一种能力。',
      }
    }
    default:
      return {
        summary: '你完成了一次思维游戏练习。',
        insight: '想法只是想法，不是命令。',
      }
  }
}

const ThinkingGames = ({ onComplete, onBack }) => {
  const [selectedGame, setSelectedGame] = useState(null)
  const [gameState, setGameState] = useState(initialState)
  const [gameProgress, setGameProgress] = useState(createThinkingGameProgressState)
  const [completedGames, setCompletedGames] = useState(new Set())
  const [completionFeedback, setCompletionFeedback] = useState(null)
  const [finishJourneyAfterFeedback, setFinishJourneyAfterFeedback] = useState(false)
  const [aiFeedback, setAiFeedback] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const aiRequestRef = useRef(0)
  const timersRef = useRef([])
  const isProgressHydratedRef = useRef(false)

  const currentGame = useMemo(
    () => games.find((game) => game.id === selectedGame) ?? null,
    [selectedGame],
  )

  const addTimer = (callback, delay) => {
    const id = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter((currentId) => currentId !== id)
      callback()
    }, delay)

    timersRef.current.push(id)
  }

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id))
    timersRef.current = []
  }

  useEffect(() => () => clearTimers(), [])

  useEffect(() => {
    const nextProgress = getThinkingGameProgress()
    setGameProgress(nextProgress)
    setCompletedGames(getCompletedGamesFromProgress(nextProgress))
    isProgressHydratedRef.current = true
  }, [])

  useEffect(() => {
    if (!isProgressHydratedRef.current) {
      return
    }

    saveThinkingGameProgress(gameProgress)
  }, [gameProgress])

  const resetAiState = () => {
    setAiFeedback(null)
    setAiLoading(false)
    setAiError('')
  }

  const resetState = () => setGameState(initialState())

  const backToSelection = () => {
    clearTimers()
    resetAiState()
    setSelectedGame(null)
    resetState()
  }

  const handleCloseFeedback = () => {
    setCompletionFeedback(null)

    if (finishJourneyAfterFeedback) {
      setFinishJourneyAfterFeedback(false)
      onComplete()
    }
  }

  const resetProgress = () => {
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm('确定要重置思维游戏进度吗？这会清空等级、次数和解锁状态。')

      if (!confirmed) {
        return
      }
    }

    clearTimers()
    resetAiState()
    setSelectedGame(null)
    setCompletionFeedback(null)
    setFinishJourneyAfterFeedback(false)
    setCompletedGames(new Set())
    setGameProgress(clearThinkingGameProgress())
    resetState()
  }

  const completeGame = (gameId) => {
    clearTimers()

    const game = games.find((item) => item.id === gameId)
    const currentProgress = gameProgress[gameId] ?? DEFAULT_THINKING_GAME_PROGRESS_ENTRY
    const currentGoal = getGameGoalForLevel(gameId, currentProgress.level)
    const currentMetric = getGameMetricValue(gameId, gameState)

    if (currentMetric < currentGoal) {
      return
    }

    const nextProgress = {
      times: currentProgress.times + 1,
      best: Math.max(currentProgress.best, currentMetric),
      level: currentProgress.level,
    }

    if (nextProgress.times % 2 === 0 && nextProgress.level < levelConfig.length - 1) {
      nextProgress.level += 1
    }

    const feedback = getFeedbackFromState(gameId, gameState)
    const aiMetadata = buildAIFeedbackMetadata(aiFeedback)
    const levelNameBefore = levelConfig[currentProgress.level]?.label ?? levelConfig[0].label
    const levelNameAfter = levelConfig[nextProgress.level]?.label ?? levelNameBefore
    const isLevelUp = nextProgress.level > currentProgress.level
    const nextCompletedGames = new Set(completedGames)
    nextCompletedGames.add(gameId)
    const nextCompletedCount = nextCompletedGames.size

    savePracticeSession({
      activityType: 'thinking_game',
      activityId: gameId,
      title: game?.title ?? '思维游戏',
      summary: feedback.summary,
      insight: feedback.insight,
      metadata: {
        completedGamesCount: nextCompletedCount,
        gameLevel: levelNameAfter,
        metricValue: currentMetric,
        goalValue: currentGoal,
        ...aiMetadata,
      },
    })

    setCompletionFeedback({
      ...feedback,
      title: game?.title ?? '思维游戏',
      icon: game?.icon ?? '🎮',
      progressSummary: `本轮 ${currentMetric}/${currentGoal} · 等级：${levelNameBefore} → ${levelNameAfter}`,
      levelUp: isLevelUp,
      levelText: levelNameAfter,
    })

    setGameProgress((prev) => ({
      ...prev,
      [gameId]: nextProgress,
    }))

    setCompletedGames(nextCompletedGames)
    setFinishJourneyAfterFeedback(nextCompletedCount >= games.length)

    resetAiState()
    setSelectedGame(null)
    resetState()
  }

  const addBubble = (value = gameState.bubbleThought) => {
    const text = value.trim()

    if (!text) {
      return
    }

    const id = Date.now() + Math.random()

    setGameState((prev) => ({
      ...prev,
      bubbleThought: '',
      bubbleCount: prev.bubbleCount + 1,
      bubbles: [...prev.bubbles, { id, text, left: Math.random() * 60 + 20, y: 0, opacity: 1 }],
    }))

    addTimer(() => {
      setGameState((prev) => ({
        ...prev,
        bubbles: prev.bubbles.map((item) => (item.id === id ? { ...item, y: -240, opacity: 0 } : item)),
      }))
    }, 40)

    addTimer(() => {
      setGameState((prev) => ({
        ...prev,
        bubbles: prev.bubbles.filter((item) => item.id !== id),
      }))
    }, 3200)
  }

  const launchTrain = (value = gameState.trainThought, clearInput = true) => {
    const text = value.trim()

    if (!text) {
      return
    }

    const id = Date.now() + Math.random()

    setGameState((prev) => ({
      ...prev,
      trainThought: clearInput ? '' : prev.trainThought,
      trainCount: prev.trainCount + 1,
      trains: [...prev.trains, { id, text, left: 115 }],
    }))

    addTimer(() => {
      setGameState((prev) => ({
        ...prev,
        trains: prev.trains.map((item) => (item.id === id ? { ...item, left: -55 } : item)),
      }))
    }, 40)

    addTimer(() => {
      setGameState((prev) => ({
        ...prev,
        trains: prev.trains.filter((item) => item.id !== id),
      }))
    }, 6200)
  }

  const startObserving = () => {
    if (gameState.observing) {
      return
    }

    const samples = ['我不够好', '别人会怎么看我', '我应该更努力', '我又搞砸了', '我很焦虑']

    setGameState((prev) => ({ ...prev, observing: true, trainThought: '' }))
    samples.forEach((sample, index) => addTimer(() => launchTrain(sample, false), index * 1800))
    addTimer(() => setGameState((prev) => ({ ...prev, observing: false })), samples.length * 1800 + 1200)
  }

  const makeGratitude = () => {
    const thought = gameState.gratitudeThought.trim()

    if (!thought) {
      return
    }

    const responses = {
      gentle: `谢谢你，我的大脑。你带来了“${thought}”这个想法。你在提醒我小心，但我现在可以先呼吸一下，再决定要不要跟着它走。`,
      coach: `谢谢提醒，大脑。我注意到“${thought}”出现了。现在我先不争论，只问自己：下一步最小行动是什么？`,
      playful: `谢谢你呀，大脑，又给我推送了“${thought}”这条热搜。我收到了，但不一定要点赞、转发、立刻照做。`,
    }

    setGameState((prev) => ({
      ...prev,
      gratitudeResponse: responses[prev.gratitudeTone],
    }))
  }

  const makeVoice = () => {
    const thought = gameState.voiceThought.trim()

    if (!thought) {
      return
    }

    const responses = {
      cartoon: `【卡通频道】啦啦啦~ 现在播报一条夸张想法：${thought}！`,
      robot: `【机器人播报】检测到自动化想法：${thought}。结论：这只是文本，不是命令。`,
      opera: `【歌剧模式】啊——“${thought}”——它正在高调登场，但很快也会谢幕。`,
      host: `【今日播报】你的大脑刚刚发来一条即时消息：${thought}。播报完毕。`,
    }

    setGameState((prev) => ({
      ...prev,
      voicePreview: responses[prev.voiceStyle],
      voiceCount: prev.voiceCount + 1,
    }))
  }

  const addLeaf = (value = gameState.leafThought) => {
    const text = value.trim()

    if (!text) {
      return
    }

    const id = Date.now() + Math.random()

    setGameState((prev) => ({
      ...prev,
      leafThought: '',
      leafCount: prev.leafCount + 1,
      leaves: [...prev.leaves, { id, text, top: Math.random() * 45 + 12, left: -18, opacity: 1, rotate: Math.random() * 24 - 12 }],
    }))

    addTimer(() => {
      setGameState((prev) => ({
        ...prev,
        leaves: prev.leaves.map((item) => (item.id === id ? { ...item, left: 108, opacity: 0.25, rotate: item.rotate + 18 } : item)),
      }))
    }, 40)

    addTimer(() => {
      setGameState((prev) => ({
        ...prev,
        leaves: prev.leaves.filter((item) => item.id !== id),
      }))
    }, 7200)
  }

  const addSampleLeaves = () => {
    ['先放着也可以', '我注意到自己很紧张', '这个念头会过去'].forEach((sample, index) => {
      addTimer(() => addLeaf(sample), index * 900)
    })
  }

  const getProgressForGame = (gameId) => {
    return gameProgress[gameId] ?? DEFAULT_THINKING_GAME_PROGRESS_ENTRY
  }

  const getGoalForGame = (gameId) => {
    const progress = getProgressForGame(gameId)
    return getGameGoalForLevel(gameId, progress.level)
  }

  const getMetricForGame = (gameId) => {
    return getGameMetricValue(gameId, gameState)
  }

  const canCompleteGame = (gameId) => {
    return getMetricForGame(gameId) >= getGoalForGame(gameId)
  }

  const aiRequestSnapshot = useMemo(() => {
    if (!selectedGame) {
      return null
    }

    const gameProgressEntry = gameProgress[selectedGame] ?? DEFAULT_THINKING_GAME_PROGRESS_ENTRY
    const metricValueByGame = {
      bubble: gameState.bubbleCount,
      train: gameState.trainCount,
      gratitude: gameState.gratitudeResponse.trim() ? 1 : 0,
      voice: gameState.voiceCount,
      leaves: gameState.leafCount,
    }
    const metricValue = metricValueByGame[selectedGame] ?? 0
    const goalValue = getGameGoalForLevel(selectedGame, gameProgressEntry.level)
    const levelLabel = levelConfig[gameProgressEntry.level]?.label ?? levelConfig[0].label

    let userInput = ''
    let gameSpecificContext = {}

    switch (selectedGame) {
      case 'bubble': {
        const draft = gameState.bubbleThought.trim()
        userInput = draft || (gameState.bubbleCount > 0 ? `我刚刚放飞了 ${gameState.bubbleCount} 个想法泡泡。` : '')
        gameSpecificContext = {
          draftThoughtLength: draft.length,
          bubbleCount: gameState.bubbleCount,
        }
        break
      }
      case 'train': {
        const draft = gameState.trainThought.trim()
        userInput = draft || (gameState.trainCount > 0 ? `我已经观察了 ${gameState.trainCount} 列想法列车。` : '')
        gameSpecificContext = {
          draftThoughtLength: draft.length,
          trainCount: gameState.trainCount,
          observing: gameState.observing,
        }
        break
      }
      case 'gratitude': {
        const thought = gameState.gratitudeThought.trim()
        const response = gameState.gratitudeResponse.trim()
        userInput = [thought ? `想法：${thought}` : '', response ? `回应：${response}` : '']
          .filter(Boolean)
          .join('；')
        gameSpecificContext = {
          gratitudeTone: gameState.gratitudeTone,
          hasResponse: Boolean(response),
        }
        break
      }
      case 'voice': {
        const thought = gameState.voiceThought.trim()
        const preview = gameState.voicePreview.trim()
        userInput = thought || preview || (gameState.voiceCount > 0 ? `我已经做了 ${gameState.voiceCount} 次声音重演练习。` : '')
        gameSpecificContext = {
          voiceStyle: gameState.voiceStyle,
          hasPreview: Boolean(preview),
          voiceCount: gameState.voiceCount,
        }
        break
      }
      case 'leaves': {
        const draft = gameState.leafThought.trim()
        userInput = draft || (gameState.leafCount > 0 ? `我已经放下了 ${gameState.leafCount} 片叶子。` : '')
        gameSpecificContext = {
          draftThoughtLength: draft.length,
          leafCount: gameState.leafCount,
        }
        break
      }
      default:
        break
    }

    const cleanedInput = userInput.trim()

    return {
      canRequest: cleanedInput.length > 0,
      accent: selectedGame === 'gratitude' || selectedGame === 'voice' ? 'violet' : 'cyan',
      payload: {
        activityType: 'thinking_game',
        stepId: selectedGame,
        userInput: cleanedInput,
        context: {
          gameTitle: currentGame?.title ?? '思维游戏',
          metricValue,
          goalValue,
          completedGamesCount: completedGames.size,
          levelLabel,
          levelIndex: gameProgressEntry.level + 1,
          practiceTimes: gameProgressEntry.times,
          ...gameSpecificContext,
        },
      },
    }
  }, [
    completedGames.size,
    currentGame?.title,
    gameProgress,
    gameState.bubbleCount,
    gameState.bubbleThought,
    gameState.gratitudeResponse,
    gameState.gratitudeThought,
    gameState.gratitudeTone,
    gameState.leafCount,
    gameState.leafThought,
    gameState.observing,
    gameState.trainCount,
    gameState.trainThought,
    gameState.voiceCount,
    gameState.voicePreview,
    gameState.voiceStyle,
    gameState.voiceThought,
    selectedGame,
  ])

  useEffect(() => {
    if (!selectedGame || !aiRequestSnapshot?.canRequest) {
      resetAiState()
      return
    }

    const requestId = aiRequestRef.current + 1
    aiRequestRef.current = requestId
    const controller = new AbortController()
    setAiFeedback(null)

    const timerId = window.setTimeout(async () => {
      try {
        setAiLoading(true)
        setAiError('')

        const result = await requestDailyJourneyFeedback(aiRequestSnapshot.payload, { signal: controller.signal })

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
  }, [aiRequestSnapshot, selectedGame])

  const renderAIFeedback = () => (
    <AIFeedbackPanel
      loading={aiLoading}
      error={aiError}
      feedback={aiFeedback}
      accent={aiRequestSnapshot?.accent ?? 'cyan'}
    />
  )

  const renderGoalProgress = (gameId) => {
    const targetConfig = gameTargets[gameId]
    const metricValue = getMetricForGame(gameId)
    const goalValue = getGoalForGame(gameId)
    const progress = getProgressForGame(gameId)
    const levelInfo = levelConfig[progress.level] ?? levelConfig[0]
    const progressPercent = Math.min((metricValue / goalValue) * 100, 100)

    return (
      <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <div className="text-white/70 text-xs">动态目标：{targetConfig?.label ?? '完成练习'}</div>
          <div className={`text-xs font-medium ${levelInfo.color}`}>当前等级：{levelInfo.label}</div>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/65">进度 {metricValue}/{goalValue}</span>
          <span className={canCompleteGame(gameId) ? 'text-green-300' : 'text-white/55'}>
            {canCompleteGame(gameId) ? '目标达成，可完成本轮' : '继续练习可解锁完成'}
          </span>
        </div>
      </div>
    )
  }

  const renderSelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🎮</div>
        <h2 className="text-3xl font-bold text-white mb-2">选择思维游戏</h2>
        <p className="text-white/80 text-lg mb-4">通过游戏化练习，学会与想法拉开距离</p>
        <div className="text-white/60 text-sm">已解锁 {completedGames.size}/{games.length} 个游戏 · 总练习 {Object.values(gameProgress).reduce((sum, item) => sum + item.times, 0)} 次</div>
        <div className="mt-3">
          <button
            onClick={resetProgress}
            className="px-4 py-2 text-xs text-white/70 border border-white/20 rounded-full hover:bg-white/10 hover:text-white transition-colors"
          >
            重置进度
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {games.map((game) => {
          const isCompleted = completedGames.has(game.id)
          const progress = getProgressForGame(game.id)
          const nextGoal = getGameGoalForLevel(game.id, progress.level)
          const levelInfo = levelConfig[progress.level] ?? levelConfig[0]

          return (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game.id)}
              className={`p-6 rounded-2xl border transition-all duration-300 text-left relative ${isCompleted ? 'bg-green-500/20 border-green-400/30' : `bg-gradient-to-r ${game.color} bg-opacity-20 border-white/20 hover:border-white/40 hover:scale-105`} cursor-pointer`}
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
                  <h3 className="text-white font-bold text-lg mb-1">{game.title}</h3>
                  <p className="text-white/80 text-sm mb-2">{game.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-xs">⏱ {game.duration} · {progress.times} 次</span>
                    <span className={`text-xs font-medium ${isCompleted ? 'text-green-400' : 'text-white/40'}`}>
                      {isCompleted ? '已解锁' : '点击开始 →'}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className={levelInfo.color}>等级：{levelInfo.label}</span>
                    <span className="text-white/60">下个目标：{gameTargets[game.id]?.label ?? '完成'} {nextGoal}</span>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )

  const renderBubble = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-6xl mb-4">🫧</div>
        <h2 className="text-3xl font-bold text-white mb-2">思维泡泡</h2>
        <p className="text-white/80 text-lg">把想法放进泡泡，练习看见它出现又离开</p>
      </div>

      <div className="relative h-80 bg-gradient-to-b from-blue-500/10 to-cyan-500/10 rounded-2xl border border-blue-400/20 overflow-hidden">
        {gameState.bubbles.map((bubble) => (
          <div
            key={bubble.id}
            className="absolute transition-all duration-[3000ms] ease-out"
            style={{ left: `${bubble.left}%`, bottom: '12%', opacity: bubble.opacity, transform: `translate(-50%, ${bubble.y}px)` }}
          >
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 rounded-full border border-blue-300/50 flex items-center justify-center backdrop-blur-sm shadow-xl px-2">
              <span className="text-white/80 text-xs text-center leading-tight">{bubble.text.length > 20 ? `${bubble.text.slice(0, 20)}...` : bubble.text}</span>
            </div>
          </div>
        ))}
        {gameState.bubbles.length === 0 && <div className="absolute inset-0 flex items-center justify-center text-white/35 text-sm text-center px-6">输入一个念头，泡泡会带着它慢慢飘远</div>}
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={gameState.bubbleThought}
            onChange={(event) => setGameState((prev) => ({ ...prev, bubbleThought: event.target.value }))}
            placeholder="例如：我永远不会成功..."
            className="flex-1 p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
            onKeyDown={(event) => event.key === 'Enter' && addBubble()}
          />
          <button onClick={() => addBubble()} disabled={!gameState.bubbleThought.trim()} className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg disabled:opacity-50">制造泡泡</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {['我会不会搞砸', '别人会不会讨厌我', '我不够好'].map((sample) => (
            <button key={sample} onClick={() => addBubble(sample)} className="px-3 py-2 bg-white/10 text-white/80 rounded-full text-sm hover:bg-white/20">{sample}</button>
          ))}
        </div>
      </div>

      {renderGoalProgress('bubble')}
      {renderAIFeedback()}
      <div className="flex justify-center"><button onClick={() => completeGame('bubble')} disabled={!canCompleteGame('bubble')} className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg disabled:opacity-50">{canCompleteGame('bubble') ? '完成游戏' : '继续练习以达成目标'}</button></div>
    </div>
  )

  const renderTrain = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-6xl mb-4">🚂</div>
        <h2 className="text-3xl font-bold text-white mb-2">思维列车</h2>
        <p className="text-white/80 text-lg">你是月台上的观察者，不需要跳上每一班列车</p>
      </div>

      <div className="relative h-60 bg-gradient-to-b from-gray-800/20 to-gray-900/20 rounded-2xl border border-gray-400/20 overflow-hidden">
        <div className="absolute bottom-16 w-full h-2 bg-gradient-to-r from-gray-600 to-gray-500 opacity-60" />
        <div className="absolute bottom-14 w-full h-1 bg-gradient-to-r from-gray-500 to-gray-400 opacity-40" />
        <div className="absolute bottom-8 left-8"><div className="text-4xl">🧍‍♀️</div><div className="text-white/60 text-xs text-center">观察者</div></div>
        {gameState.trains.map((train) => (
          <div key={train.id} className="absolute bottom-20 transition-all duration-[6000ms] ease-linear" style={{ left: `${train.left}%` }}>
            <div className="flex items-center"><div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-3 shadow-lg min-w-32 max-w-48"><div className="text-white text-sm font-medium text-center">{train.text}</div></div><div className="text-3xl ml-2">🚂</div></div>
          </div>
        ))}
      </div>

      {!gameState.observing ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={gameState.trainThought}
              onChange={(event) => setGameState((prev) => ({ ...prev, trainThought: event.target.value }))}
              placeholder="输入一个想法，让它成为火车..."
              className="flex-1 p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
              onKeyDown={(event) => event.key === 'Enter' && launchTrain()}
            />
            <button onClick={() => launchTrain()} disabled={!gameState.trainThought.trim()} className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-lg disabled:opacity-50">发车</button>
          </div>
          <div className="text-center"><button onClick={startObserving} className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-lg">开始观察练习</button></div>
        </div>
      ) : (
        <div className="text-center bg-white/10 rounded-2xl p-4 border border-white/10"><p className="text-white/80 text-sm mb-2">保持观察者的角色，不要跳上任何一列火车。</p><div className="text-white/60 text-xs">观察练习进行中...</div></div>
      )}

      {renderGoalProgress('train')}
      {renderAIFeedback()}
      <div className="flex justify-center"><button onClick={() => completeGame('train')} disabled={!canCompleteGame('train')} className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg disabled:opacity-50">{canCompleteGame('train') ? '完成游戏' : '继续练习以达成目标'}</button></div>
    </div>
  )

  const renderGratitude = () => (
    <div className="space-y-6">
      <div className="text-center"><div className="text-6xl mb-4">🧠</div><h2 className="text-3xl font-bold text-white mb-2">感谢大脑</h2><p className="text-white/80 text-lg">不再和想法对打，而是先看见它、感谢它</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">{gratitudeTones.map((tone) => <button key={tone.id} onClick={() => setGameState((prev) => ({ ...prev, gratitudeTone: tone.id }))} className={`rounded-2xl border p-4 text-left transition-all duration-300 ${gameState.gratitudeTone === tone.id ? 'bg-white/20 border-purple-300 shadow-lg' : 'bg-white/8 border-white/10 hover:bg-white/12'}`}><div className="text-2xl mb-2">{tone.icon}</div><div className="text-white font-semibold mb-1">{tone.label}</div><div className="text-white/60 text-sm">{tone.helper}</div></button>)}</div>
      <div className="bg-white/10 rounded-2xl p-5 border border-white/10 space-y-4"><textarea value={gameState.gratitudeThought} onChange={(event) => setGameState((prev) => ({ ...prev, gratitudeThought: event.target.value }))} placeholder="例如：我肯定又要搞砸了" className="w-full h-28 p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/40" /><button onClick={makeGratitude} disabled={!gameState.gratitudeThought.trim()} className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl disabled:opacity-50">生成回应</button></div>
      {gameState.gratitudeResponse && <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-400/30"><p className="text-white/90 text-lg leading-relaxed">{gameState.gratitudeResponse}</p></div>}
      {renderGoalProgress('gratitude')}
      {renderAIFeedback()}
      <div className="flex justify-center"><button onClick={() => completeGame('gratitude')} disabled={!canCompleteGame('gratitude')} className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg disabled:opacity-50">{canCompleteGame('gratitude') ? '完成游戏' : '请先生成回应'}</button></div>
    </div>
  )

  const renderVoice = () => (
    <div className="space-y-6">
      <div className="text-center"><div className="text-6xl mb-4">🎭</div><h2 className="text-3xl font-bold text-white mb-2">滑稽声音</h2><p className="text-white/80 text-lg">改变“说法”，降低想法的威胁感和严肃度</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{voiceStyles.map((style) => <button key={style.id} onClick={() => setGameState((prev) => ({ ...prev, voiceStyle: style.id }))} className={`rounded-2xl border p-4 text-left transition-all duration-300 ${gameState.voiceStyle === style.id ? 'bg-white/20 border-orange-300 shadow-lg' : 'bg-white/8 border-white/10 hover:bg-white/12'}`}><div className="text-2xl mb-2">{style.icon}</div><div className="text-white font-semibold">{style.label}</div></button>)}</div>
      <div className="bg-white/10 rounded-2xl p-5 border border-white/10 space-y-4"><input type="text" value={gameState.voiceThought} onChange={(event) => setGameState((prev) => ({ ...prev, voiceThought: event.target.value }))} placeholder="例如：这下肯定完蛋了" className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/40" onKeyDown={(event) => event.key === 'Enter' && makeVoice()} /><button onClick={makeVoice} disabled={!gameState.voiceThought.trim()} className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl disabled:opacity-50">开始重新演绎</button></div>
      <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl p-6 border border-orange-400/30 min-h-36 flex items-center justify-center">{gameState.voicePreview ? <p className="text-white/90 text-lg leading-relaxed text-center">{gameState.voicePreview}</p> : <div className="text-white/45 text-sm text-center px-6">选择一种声音风格，再让想法重新“登场”一次</div>}</div>
      <div className="text-center text-white/60 text-sm">你已经尝试了 {gameState.voiceCount} 次重新演绎</div>
      {renderGoalProgress('voice')}
      {renderAIFeedback()}
      <div className="flex justify-center"><button onClick={() => completeGame('voice')} disabled={!canCompleteGame('voice')} className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg disabled:opacity-50">{canCompleteGame('voice') ? '完成游戏' : '继续演绎以达成目标'}</button></div>
    </div>
  )

  const renderLeaves = () => (
    <div className="space-y-6">
      <div className="text-center"><div className="text-6xl mb-4">🍃</div><h2 className="text-3xl font-bold text-white mb-2">溪流叶子</h2><p className="text-white/80 text-lg">把想法轻轻放在叶子上，看它顺流而下</p></div>
      <div className="relative h-80 bg-gradient-to-b from-emerald-500/10 via-cyan-500/10 to-blue-500/10 rounded-2xl border border-emerald-400/20 overflow-hidden">{gameState.leaves.map((leaf) => <div key={leaf.id} className="absolute transition-all duration-[7000ms] ease-linear" style={{ top: `${leaf.top}%`, left: `${leaf.left}%`, opacity: leaf.opacity, transform: `rotate(${leaf.rotate}deg)` }}><div className="w-28 h-16 bg-gradient-to-r from-emerald-400/50 to-lime-300/40 rounded-[60%_40%_60%_40%] border border-emerald-200/50 shadow-lg flex items-center justify-center px-3"><span className="text-white/90 text-xs text-center leading-tight">{leaf.text.length > 18 ? `${leaf.text.slice(0, 18)}...` : leaf.text}</span></div></div>)}{gameState.leaves.length === 0 && <div className="absolute inset-0 flex items-center justify-center text-white/35 text-sm text-center px-6">溪流正在流动，准备好后放下一片叶子吧</div>}</div>
      <div className="bg-white/10 rounded-2xl p-5 border border-white/10 space-y-4"><div className="flex flex-col sm:flex-row gap-3"><input type="text" value={gameState.leafThought} onChange={(event) => setGameState((prev) => ({ ...prev, leafThought: event.target.value }))} placeholder="例如：我现在有点紧张" className="flex-1 p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/40" onKeyDown={(event) => event.key === 'Enter' && addLeaf()} /><button onClick={() => addLeaf()} disabled={!gameState.leafThought.trim()} className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl disabled:opacity-50">放下叶子</button></div><div className="flex flex-col sm:flex-row gap-3"><button onClick={addSampleLeaves} className="flex-1 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20">释放示例叶子</button><div className="flex-1 flex items-center justify-center text-white/60 text-sm bg-white/5 rounded-xl border border-white/10 px-4">已放下 {gameState.leafCount} 片叶子</div></div></div>
      {renderGoalProgress('leaves')}
      {renderAIFeedback()}
      <div className="flex justify-center"><button onClick={() => completeGame('leaves')} disabled={!canCompleteGame('leaves')} className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg disabled:opacity-50">{canCompleteGame('leaves') ? '完成游戏' : '继续放下叶子'}</button></div>
    </div>
  )

  const renderCurrentGame = () => ({ bubble: renderBubble(), train: renderTrain(), gratitude: renderGratitude(), voice: renderVoice(), leaves: renderLeaves() }[selectedGame] ?? null)

  if (currentGame) {
    return (
      <div className={`min-h-screen relative overflow-hidden bg-gradient-to-b ${currentGame.screen}`}>
        <OptimizedParticleBackground color={currentGame.particle} quantity={8} />
        <div className="relative z-10 min-h-screen flex flex-col">
          <div className="flex items-center justify-between p-6"><button onClick={backToSelection} className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"><span className="text-2xl">←</span><span>返回</span></button><div className="text-right text-white/70 text-sm">已完成 {completedGames.size}/{games.length}</div></div>
          <div className="flex-1 px-6 pb-24" style={{ paddingBottom: BOTTOM_SAFE_PADDING }}><div className="max-w-2xl mx-auto">{renderCurrentGame()}</div></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-900 to-slate-900">
      <OptimizedParticleBackground color="#6366F1" quantity={10} />
      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="flex items-center justify-between p-6"><button onClick={onBack} className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"><span className="text-2xl">←</span><span>返回</span></button><div className="text-center"><h1 className="text-2xl font-bold text-white">思维游戏</h1><p className="text-white/70">ACT认知解离练习</p></div><div className="w-16" /></div>
        <div className="flex-1 px-6 pb-24" style={{ paddingBottom: BOTTOM_SAFE_PADDING }}><div className="max-w-2xl mx-auto">{renderSelection()}</div></div>

        {completionFeedback && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900/90 border border-white/10 rounded-3xl p-6 shadow-2xl">
              <div className="text-center mb-5">
                <div className="text-5xl mb-3">{completionFeedback.icon}</div>
                <h3 className="text-white text-2xl font-bold mb-2">{completionFeedback.title} 已完成</h3>
                <p className="text-green-300 text-sm">练习已记录到历史与洞察数据中</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-4">
                <div className="text-white/60 text-xs uppercase tracking-[0.2em] mb-2">本次收获</div>
                <p className="text-white/90 leading-relaxed mb-3">{completionFeedback.summary}</p>
                <p className="text-cyan-200 text-sm leading-relaxed">{completionFeedback.insight}</p>
                <p className="text-white/70 text-xs mt-3">{completionFeedback.progressSummary}</p>
                {completionFeedback.levelUp && (
                  <p className="text-emerald-300 text-xs mt-1">已升级到 {completionFeedback.levelText} 难度</p>
                )}
              </div>
              <button onClick={handleCloseFeedback} className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-2xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300">
                {finishJourneyAfterFeedback ? '完成本次思维游戏旅程' : '继续查看其他游戏'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ThinkingGames
