import { useEffect, useState } from 'react'
import OptimizedParticleBackground from './OptimizedParticleBackground'
import {
  deleteJournalEntry,
  getJournalEntries,
  JOURNAL_STORAGE_UPDATED_EVENT,
  updateJournalEntry,
} from '../lib/journalStorage'
import {
  deletePracticeSession,
  getPracticeSessions,
  PRACTICE_STORAGE_UPDATED_EVENT,
} from '../lib/practiceStorage'
import { getPracticeInfo } from '../lib/practiceVisualTags'
import PracticeTags from './PracticeTags'
import { BOTTOM_SAFE_PADDING } from '../lib/layoutConstants'

const practiceMetadataLabels = {
  nextAction: '下一步',
  category: '分类',
  difficulty: '难度',
  duration: '时长',
  completedGamesCount: '累计完成游戏',
  gameLevel: '游戏等级',
  metricValue: '本轮进度',
  goalValue: '目标值',
  selectedValuesText: '价值方向',
  actionPlan: '行动计划',
  thought: '核心想法',
  trap: '识别陷阱',
  responses: '练习内容',
  aiEncouragement: 'AI 鼓励',
  aiNextAction: 'AI 下一步建议',
  aiFollowUpQuestion: 'AI 追问',
  aiRiskFlag: 'AI 风险级别',
  aiRiskReason: 'AI 风险说明',
}

const moodConfig = {
  happy: { name: '开心', emoji: '😊', color: 'from-green-400 to-emerald-500', borderColor: 'border-green-400' },
  sad: { name: '难过', emoji: '😢', color: 'from-blue-400 to-cyan-500', borderColor: 'border-blue-400' },
  angry: { name: '愤怒', emoji: '😠', color: 'from-red-400 to-rose-500', borderColor: 'border-red-400' },
  anxious: { name: '焦虑', emoji: '😰', color: 'from-purple-400 to-violet-500', borderColor: 'border-purple-400' },
  calm: { name: '平静', emoji: '😌', color: 'from-cyan-400 to-blue-500', borderColor: 'border-cyan-400' },
  excited: { name: '兴奋', emoji: '🤩', color: 'from-yellow-400 to-orange-500', borderColor: 'border-yellow-400' },
}

const filterOptions = [
  { id: 'all', name: '全部记录', icon: '📖' },
  { id: 'happy', name: '开心', icon: '😊' },
  { id: 'sad', name: '难过', icon: '😢' },
  { id: 'angry', name: '愤怒', icon: '😠' },
  { id: 'anxious', name: '焦虑', icon: '😰' },
  { id: 'calm', name: '平静', icon: '😌' },
  { id: 'excited', name: '兴奋', icon: '🤩' },
]

const tagOptions = [
  '工作',
  '学习',
  '家庭',
  '朋友',
  '健康',
  '运动',
  '娱乐',
  '旅行',
  '爱情',
  '金钱',
  '天气',
  '其他',
]

const HISTORY_MOOD_FILTER_KEY = 'historyMoodFilter'
const HISTORY_PRACTICE_TYPE_FILTER_KEY = 'historyPracticeTypeFilter'
const HISTORY_PRACTICE_RANGE_FILTER_KEY = 'historyPracticeRangeFilter'

const practiceRangeOptions = [
  { id: 'all', label: '全部时间' },
  { id: '7d', label: '近7天' },
  { id: '30d', label: '近30天' },
]

const getStoredFilter = (storageKey, fallbackValue, validValues = []) => {
  if (typeof window === 'undefined') {
    return fallbackValue
  }

  const storedValue = window.localStorage.getItem(storageKey)

  if (!storedValue) {
    return fallbackValue
  }

  if (validValues.length > 0 && !validValues.includes(storedValue)) {
    return fallbackValue
  }

  return storedValue
}

const createEditForm = (entry) => ({
  mood: entry?.mood ?? '',
  intensity: Number(entry?.intensity ?? 5),
  content: entry?.content ?? '',
  tags: Array.isArray(entry?.tags) ? entry.tags : [],
})

const parseLocalDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') {
    return null
  }

  const [year, month, day] = dateStr.split('-').map(Number)

  if (!year || !month || !day) {
    return null
  }

  return new Date(year, month - 1, day)
}

const getRangeStartDate = (rangeId) => {
  if (rangeId === 'all') {
    return null
  }

  const daysMap = {
    '7d': 6,
    '30d': 29,
  }

  const daysToSubtract = daysMap[rangeId]

  if (typeof daysToSubtract !== 'number') {
    return null
  }

  const startDate = new Date()
  startDate.setHours(0, 0, 0, 0)
  startDate.setDate(startDate.getDate() - daysToSubtract)
  return startDate
}

const isSessionInRange = (sessionDate, rangeId) => {
  const startDate = getRangeStartDate(rangeId)

  if (!startDate) {
    return true
  }

  const currentDate = parseLocalDate(sessionDate)

  if (!currentDate) {
    return false
  }

  return currentDate >= startDate
}

const formatMetadataValue = (value, key = '') => {
  if (key === 'aiRiskFlag') {
    if (value === 'high') {
      return '高风险'
    }

    if (value === 'mild') {
      return '中风险'
    }

    if (value === 'none') {
      return '低风险'
    }
  }

  if (Array.isArray(value)) {
    return value.join('、')
  }

  if (value && typeof value === 'object') {
    const filledEntries = Object.values(value).filter((item) => {
      if (typeof item === 'string') {
        return item.trim().length > 0
      }

      return item !== null && item !== undefined && item !== ''
    })

    return filledEntries.length > 0 ? `已记录 ${filledEntries.length} 项内容` : '已记录练习内容'
  }

  if (value === 'wave') {
    return '继续感受的浪潮'
  }

  if (value === 'home') {
    return '返回首页'
  }

  return String(value)
}

const getPracticeMetadataItems = (metadata = {}) => {
  return Object.entries(metadata)
    .filter(([, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0
      }

      if (value && typeof value === 'object') {
        return Object.keys(value).length > 0
      }

      return value !== null && value !== undefined && value !== ''
    })
    .map(([key, value]) => ({
      key,
      label: practiceMetadataLabels[key] ?? key,
      value: formatMetadataValue(value, key),
    }))
}

const getPracticeAISummary = (session) => {
  const metadata = session?.metadata && typeof session.metadata === 'object' ? session.metadata : {}

  return {
    encouragement: typeof metadata.aiEncouragement === 'string' ? metadata.aiEncouragement.trim() : '',
    nextAction: typeof metadata.aiNextAction === 'string' ? metadata.aiNextAction.trim() : '',
    followUpQuestion: typeof metadata.aiFollowUpQuestion === 'string' ? metadata.aiFollowUpQuestion.trim() : '',
    riskFlag: typeof metadata.aiRiskFlag === 'string' ? metadata.aiRiskFlag.trim() : '',
    riskReason: typeof metadata.aiRiskReason === 'string' ? metadata.aiRiskReason.trim() : '',
  }
}

const HistoryPage = () => {
  const [selectedFilter, setSelectedFilter] = useState(() => {
    return getStoredFilter(
      HISTORY_MOOD_FILTER_KEY,
      'all',
      filterOptions.map((option) => option.id),
    )
  })
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [selectedPracticeType, setSelectedPracticeType] = useState(() => {
    return getStoredFilter(HISTORY_PRACTICE_TYPE_FILTER_KEY, 'all')
  })
  const [selectedPracticeRange, setSelectedPracticeRange] = useState(() => {
    return getStoredFilter(
      HISTORY_PRACTICE_RANGE_FILTER_KEY,
      'all',
      practiceRangeOptions.map((option) => option.id),
    )
  })
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [selectedPracticeSession, setSelectedPracticeSession] = useState(null)
  const [journalEntries, setJournalEntries] = useState([])
  const [practiceSessions, setPracticeSessions] = useState([])
  const [showAllPractice, setShowAllPractice] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editError, setEditError] = useState('')
  const [editForm, setEditForm] = useState(createEditForm())

  useEffect(() => {
    const syncEntries = () => {
      setJournalEntries(getJournalEntries())
    }

    const syncPracticeSessions = () => {
      setPracticeSessions(getPracticeSessions())
    }

    syncEntries()
    syncPracticeSessions()

    window.addEventListener(JOURNAL_STORAGE_UPDATED_EVENT, syncEntries)
    window.addEventListener(PRACTICE_STORAGE_UPDATED_EVENT, syncPracticeSessions)
    window.addEventListener('storage', syncEntries)
    window.addEventListener('storage', syncPracticeSessions)

    return () => {
      window.removeEventListener(JOURNAL_STORAGE_UPDATED_EVENT, syncEntries)
      window.removeEventListener(PRACTICE_STORAGE_UPDATED_EVENT, syncPracticeSessions)
      window.removeEventListener('storage', syncEntries)
      window.removeEventListener('storage', syncPracticeSessions)
    }
  }, [])

  useEffect(() => {
    if (!selectedEntry) {
      setIsEditing(false)
      setEditError('')
      setEditForm(createEditForm())
      return
    }

    setEditForm(createEditForm(selectedEntry))
    setEditError('')
  }, [selectedEntry])

  const filteredEntries = selectedFilter === 'all'
    ? journalEntries
    : journalEntries.filter((entry) => entry.mood === selectedFilter)

  const formatDate = (dateStr) => {
    const date = parseLocalDate(dateStr)

    if (!date) {
      return dateStr ?? '未知日期'
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return '今天'
    }

    if (date.toDateString() === yesterday.toDateString()) {
      return '昨天'
    }

    return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })
  }

  const stats = {
    total: journalEntries.length,
    positive: journalEntries.filter((entry) => ['happy', 'excited', 'calm'].includes(entry.mood)).length,
    avgIntensity: journalEntries.length > 0
      ? Math.round(journalEntries.reduce((sum, entry) => sum + entry.intensity, 0) / journalEntries.length)
      : 0,
    practiceTotal: practiceSessions.length,
  }

  const practiceTypeDistribution = [...practiceSessions.reduce((map, session) => {
    const activityType = session.activityType ?? 'practice'
    map.set(activityType, (map.get(activityType) ?? 0) + 1)
    return map
  }, new Map()).entries()]
    .map(([activityType, count]) => ({
      activityType,
      count,
      ...getPracticeInfo(activityType),
    }))
    .sort((firstItem, secondItem) => secondItem.count - firstItem.count)

  const practiceTypeOptions = [
    { activityType: 'all', label: '全部练习', icon: '✨', count: practiceSessions.length },
    ...practiceTypeDistribution.map((item) => ({
      activityType: item.activityType,
      label: item.name,
      icon: item.icon,
      count: item.count,
    })),
  ]

  const practiceSessionsByType = selectedPracticeType === 'all'
    ? practiceSessions
    : practiceSessions.filter((session) => (session.activityType ?? 'practice') === selectedPracticeType)

  const filteredPracticeSessions = practiceSessionsByType.filter((session) => isSessionInRange(session.date, selectedPracticeRange))

  const currentPracticeFilter = practiceTypeOptions.find((option) => option.activityType === selectedPracticeType) ?? practiceTypeOptions[0]
  const currentPracticeRange = practiceRangeOptions.find((option) => option.id === selectedPracticeRange) ?? practiceRangeOptions[0]

  const practiceStats = {
    recent: practiceSessionsByType.filter((session) => isSessionInRange(session.date, '7d')).length,
    distinctTypes: new Set(filteredPracticeSessions.map((session) => session.activityType ?? 'practice')).size,
  }

  const visiblePracticeSessions = showAllPractice ? filteredPracticeSessions : filteredPracticeSessions.slice(0, 6)

  useEffect(() => {
    if (selectedPracticeType !== 'all' && !practiceTypeDistribution.some((item) => item.activityType === selectedPracticeType)) {
      setSelectedPracticeType('all')
    }
  }, [practiceTypeDistribution, selectedPracticeType])

  useEffect(() => {
    if (!practiceRangeOptions.some((option) => option.id === selectedPracticeRange)) {
      setSelectedPracticeRange('all')
    }
  }, [selectedPracticeRange])

  useEffect(() => {
    setShowAllPractice(false)
  }, [selectedPracticeType, selectedPracticeRange])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(HISTORY_MOOD_FILTER_KEY, selectedFilter)
    }
  }, [selectedFilter])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(HISTORY_PRACTICE_TYPE_FILTER_KEY, selectedPracticeType)
    }
  }, [selectedPracticeType])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(HISTORY_PRACTICE_RANGE_FILTER_KEY, selectedPracticeRange)
    }
  }, [selectedPracticeRange])

  const closeDetailModal = () => {
    setSelectedEntry(null)
    setIsEditing(false)
    setIsSaving(false)
    setEditError('')
  }

  const handleOpenEntry = (entry) => {
    setSelectedEntry(entry)
    setIsEditing(false)
    setEditError('')
  }

  const handleOpenPracticeSession = (session) => {
    setSelectedPracticeSession(session)
  }

  const closePracticeDetailModal = () => {
    setSelectedPracticeSession(null)
  }

  const handleDeletePracticeSession = () => {
    if (!selectedPracticeSession) {
      return
    }

    const shouldDelete = window.confirm('确定要删除这条练习记录吗？')

    if (!shouldDelete) {
      return
    }

    const nextSessions = deletePracticeSession(selectedPracticeSession.id)
    setPracticeSessions(nextSessions)
    closePracticeDetailModal()
  }

  const handleStartEditing = () => {
    if (!selectedEntry) {
      return
    }

    setEditForm(createEditForm(selectedEntry))
    setEditError('')
    setIsEditing(true)
  }

  const handleCancelEditing = () => {
    setEditForm(createEditForm(selectedEntry))
    setEditError('')
    setIsEditing(false)
  }

  const handleTagToggle = (tagName) => {
    setEditForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagName)
        ? prev.tags.filter((tag) => tag !== tagName)
        : [...prev.tags, tagName],
    }))
  }

  const handleSaveEdit = async () => {
    if (!selectedEntry) {
      return
    }

    const trimmedContent = editForm.content.trim()

    if (!editForm.mood || !trimmedContent) {
      setEditError('请选择情绪并填写日志内容')
      return
    }

    setIsSaving(true)
    setEditError('')

    try {
      await new Promise((resolve) => setTimeout(resolve, 250))

      const updatedEntry = updateJournalEntry(selectedEntry.id, {
        mood: editForm.mood,
        intensity: Number(editForm.intensity),
        content: trimmedContent,
        tags: editForm.tags,
      })

      if (!updatedEntry) {
        throw new Error('update_failed')
      }

      setJournalEntries(getJournalEntries())
      setSelectedEntry(updatedEntry)
      setIsEditing(false)
    } catch {
      setEditError('保存失败，请稍后重试')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteEntry = () => {
    if (!selectedEntry) {
      return
    }

    const shouldDelete = window.confirm('确定要删除这条情绪日志吗？')

    if (!shouldDelete) {
      return
    }

    const nextEntries = deleteJournalEntry(selectedEntry.id)
    setJournalEntries(nextEntries)
    closeDetailModal()
  }

  const selectedMoodInfo = selectedEntry ? (moodConfig[selectedEntry.mood] ?? moodConfig.calm) : moodConfig.calm

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("/src/assets/history-bg.webp")',
          filter: 'brightness(0.7)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-purple-900/60 to-slate-900/80" />

      <OptimizedParticleBackground color="#8B5CF6" quantity={12} />

      <div className="relative z-10 min-h-screen">
        <div className="flex items-center justify-between p-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">📚 情绪档案</h1>
            <p className="text-white/70 text-sm">回顾您的心路历程</p>
          </div>
          <button
            onClick={() => setShowFilterModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-all duration-300"
          >
            <span>🔍</span>
            <span className="text-sm">筛选</span>
          </button>
        </div>

        <div className="px-6 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <h3 className="text-white font-semibold mb-3 flex items-center">
              <span className="mr-2">📊</span>
              本周统计
            </h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{stats.total}</div>
                <div className="text-white/70 text-xs">总记录</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{stats.positive}</div>
                <div className="text-white/70 text-xs">积极情绪</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{stats.avgIntensity}</div>
                <div className="text-white/70 text-xs">平均强度</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-300">{stats.practiceTotal}</div>
                <div className="text-white/70 text-xs">练习次数</div>
              </div>
            </div>
          </div>
        </div>

        {practiceSessions.length > 0 && (
          <div className="px-6 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-white font-semibold flex items-center mb-1">
                    <span className="mr-2">🎮</span>
                    练习档案
                  </h3>
                  <p className="text-white/55 text-xs">
                    当前筛选：{currentPracticeFilter.label} · {currentPracticeRange.label} · 共 {filteredPracticeSessions.length} 条 · 近 7 天 {practiceStats.recent} 次 · {practiceStats.distinctTypes} 类练习
                  </p>
                </div>
                {filteredPracticeSessions.length > 6 && (
                  <button
                    onClick={() => setShowAllPractice((prev) => !prev)}
                    className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 text-xs transition-all duration-300"
                  >
                    {showAllPractice ? '收起' : '查看全部'}
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {practiceTypeOptions.map((option) => (
                  <button
                    key={option.activityType}
                    type="button"
                    onClick={() => setSelectedPracticeType(option.activityType)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-all duration-300 ${
                      selectedPracticeType === option.activityType
                        ? 'bg-white/20 border-cyan-300/45 text-white'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                    <span className="text-[11px] text-white/55">{option.count}</span>
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {practiceRangeOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedPracticeRange(option.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-all duration-300 ${
                      selectedPracticeRange === option.id
                        ? 'bg-cyan-500/20 border-cyan-300/45 text-cyan-100'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>

              {visiblePracticeSessions.length === 0 ? (
                <div className="rounded-xl bg-white/5 border border-white/10 p-5 text-center">
                  <div className="text-white/75 text-sm mb-1">当前筛选下暂无练习记录</div>
                  <div className="text-white/45 text-xs">可切换上方类型或时间范围，或完成新的练习后再回来查看。</div>
                </div>
              ) : (
                <div className="space-y-3">
	                  {visiblePracticeSessions.map((session) => {
	                    const practiceInfo = getPracticeInfo(session.activityType)
	                    const aiSummary = getPracticeAISummary(session)

	                    return (
                      <button
                        key={session.id}
                        type="button"
                        onClick={() => handleOpenPracticeSession(session)}
                        className="w-full text-left bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-lg">{practiceInfo.icon}</span>
                              <span className="text-white font-medium">{session.title}</span>
                            </div>
                          </div>
                          <div className="text-white/50 text-xs text-right">
                            {formatDate(session.date)} {session.time}
                          </div>
                        </div>
	                        <p className="text-white/75 text-sm mb-2 leading-relaxed">{session.summary}</p>
	                        <p className="text-cyan-200/90 text-xs leading-relaxed">{session.insight}</p>
	                        {aiSummary.nextAction && (
	                          <div className="mt-2 rounded-lg border border-violet-300/25 bg-violet-500/10 px-3 py-2">
	                            <p className="text-violet-100/90 text-xs leading-relaxed">
	                              AI 建议：{aiSummary.nextAction}
	                            </p>
	                          </div>
	                        )}
	                        <PracticeTags session={session} className="mt-3" />
                        <div className="text-right mt-3 text-white/35 text-xs">
                          查看练习详情 →
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {!showAllPractice && filteredPracticeSessions.length > visiblePracticeSessions.length && (
                <div className="mt-3 text-center">
                  <span className="text-white/45 text-xs">
                    还有 {filteredPracticeSessions.length - visiblePracticeSessions.length} 条练习记录未展开
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="px-6 pb-24" style={{ paddingBottom: BOTTOM_SAFE_PADDING }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold flex items-center">
              <span className="mr-2">📝</span>
              情绪日志
            </h3>
            <span className="text-white/45 text-xs">当前筛选：{filterOptions.find((option) => option.id === selectedFilter)?.name ?? '全部记录'}</span>
          </div>

          {filteredEntries.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-3xl">📝</span>
              </div>
              <h3 className="text-white font-semibold mb-2">暂无日志记录</h3>
              <p className="text-white/70 text-sm">
                {selectedFilter === 'all' ? '开始记录您的第一篇情绪日志吧' : '没有找到相关的情绪记录'}
              </p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-yellow-400 via-blue-400 to-purple-400 opacity-30" />

              <div className="space-y-6">
                {filteredEntries.map((entry) => {
                  const moodInfo = moodConfig[entry.mood] ?? moodConfig.calm

                  return (
                    <div key={entry.id} className="relative flex items-start space-x-4">
                      <div className={`relative z-10 w-4 h-4 rounded-full bg-gradient-to-r ${moodInfo.color} border-2 border-white shadow-lg`} />

                      <div
                        className={`flex-1 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border-l-4 ${moodInfo.borderColor} hover:bg-white/20 transition-all duration-300 cursor-pointer group`}
                        onClick={() => handleOpenEntry(entry)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{moodInfo.emoji}</span>
                            <span className="text-white font-medium">{moodInfo.name}</span>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, index) => (
                                <div
                                  key={index}
                                  className={`w-2 h-2 rounded-full ${
                                    index < Math.round(entry.intensity / 2) ? 'bg-yellow-400' : 'bg-white/20'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="text-white/60 text-sm">
                            {formatDate(entry.date)} {entry.time}
                          </div>
                        </div>

                        <p className="text-white/80 text-sm mb-3 line-clamp-2">{entry.content}</p>

                        <div className="flex flex-wrap gap-2">
                          {entry.tags.map((tag) => (
                            <span
                              key={`${entry.id}-${tag}`}
                              className="px-2 py-1 bg-white/10 rounded-full text-white/70 text-xs"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>

                        <div className="text-white/40 group-hover:text-yellow-400 transition-colors mt-2 text-right">
                          <span className="text-sm">查看详情 →</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {showFilterModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
          <div className="w-full bg-white/10 backdrop-blur-md rounded-t-3xl p-6 transform transition-transform duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold text-lg">筛选情绪</h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {filterOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    setSelectedFilter(option.id)
                    setShowFilterModal(false)
                  }}
                  className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 ${
                    selectedFilter === option.id
                      ? 'bg-gradient-to-r from-yellow-400/30 to-orange-400/30 border border-yellow-400/50'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  <span className="text-xl">{option.icon}</span>
                  <span className="text-white font-medium">{option.name}</span>
                  {selectedFilter === option.id && (
                    <span className="ml-auto text-yellow-400">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedEntry && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-lg">{isEditing ? '编辑日志' : '日志详情'}</h3>
              <button
                onClick={closeDetailModal}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white"
              >
                ✕
              </button>
            </div>

            {!isEditing ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{selectedMoodInfo.emoji}</span>
                  <div>
                    <div className="text-white font-medium">{selectedMoodInfo.name}</div>
                    <div className="text-white/60 text-sm">
                      {formatDate(selectedEntry.date)} {selectedEntry.time}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-white/70 text-sm">强度:</span>
                  <div className="flex items-center space-x-1">
                    {[...Array(10)].map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index < selectedEntry.intensity ? 'bg-yellow-400' : 'bg-white/20'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-yellow-400 text-sm">{selectedEntry.intensity}/10</span>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-white/90 leading-relaxed">{selectedEntry.content}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedEntry.tags.length > 0 ? selectedEntry.tags.map((tag) => (
                    <span
                      key={`${selectedEntry.id}-${tag}`}
                      className="px-3 py-1 bg-white/10 rounded-full text-white/70 text-sm"
                    >
                      #{tag}
                    </span>
                  )) : (
                    <span className="text-white/50 text-sm">暂无标签</span>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleStartEditing}
                    className="flex-1 py-3 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-colors"
                  >
                    编辑
                  </button>
                  <button
                    onClick={handleDeleteEntry}
                    className="flex-1 py-3 bg-red-500/20 rounded-xl text-red-300 hover:bg-red-500/30 transition-colors"
                  >
                    删除
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <div className="text-white/80 text-sm mb-3">选择情绪</div>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(moodConfig).map(([moodId, mood]) => (
                      <button
                        key={moodId}
                        onClick={() => setEditForm((prev) => ({ ...prev, mood: moodId }))}
                        className={`rounded-xl border p-3 text-center transition-all duration-300 ${
                          editForm.mood === moodId
                            ? 'bg-white/20 border-yellow-400 shadow-lg'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-2xl mb-1">{mood.emoji}</div>
                        <div className="text-white text-sm">{mood.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 text-sm mb-2">情绪强度：{editForm.intensity}/10</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={editForm.intensity}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, intensity: Number(event.target.value) }))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm mb-2">日志内容</label>
                  <textarea
                    value={editForm.content}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, content: event.target.value }))}
                    maxLength={500}
                    className="w-full h-32 p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 transition-colors"
                    placeholder="分享你的想法、感受或今天发生的事情..."
                  />
                  <p className="text-right text-white/50 text-xs mt-1">{editForm.content.length} / 500</p>
                </div>

                <div>
                  <div className="text-white/80 text-sm mb-3">相关标签</div>
                  <div className="flex flex-wrap gap-2">
                    {tagOptions.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={`px-3 py-2 rounded-full border text-sm transition-all duration-300 ${
                          editForm.tags.includes(tag)
                            ? 'bg-white/20 border-yellow-400 text-white'
                            : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {editError && (
                  <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-red-200 text-sm">
                    {editError}
                  </div>
                )}

                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={handleCancelEditing}
                    className="flex-1 py-3 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-colors"
                    disabled={isSaving}
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl text-slate-900 font-semibold hover:from-yellow-300 hover:to-orange-300 transition-colors disabled:opacity-70"
                    disabled={isSaving}
                  >
                    {isSaving ? '保存中...' : '保存修改'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedPracticeSession && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
	            {(() => {
	              const selectedPracticeInfo = getPracticeInfo(selectedPracticeSession.activityType)
	              const aiSummary = getPracticeAISummary(selectedPracticeSession)
	              const hasAiSummary = Boolean(
	                aiSummary.encouragement
	                || aiSummary.nextAction
	                || aiSummary.followUpQuestion
	                || aiSummary.riskReason,
	              )

	              return (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold text-lg">练习详情</h3>
                    <button
                      onClick={closePracticeDetailModal}
                      className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{selectedPracticeInfo.icon}</span>
                      <div>
                        <div className="text-white font-medium">{selectedPracticeSession.title}</div>
                        <div className="text-white/60 text-sm">
                          {selectedPracticeInfo.name} · {formatDate(selectedPracticeSession.date)} {selectedPracticeSession.time}
                        </div>
                      </div>
                    </div>

                    <PracticeTags session={selectedPracticeSession} size="md" />

                    <div className="bg-white/5 rounded-xl p-4">
                      <div className="text-white/60 text-xs mb-2">练习总结</div>
                      <p className="text-white/90 leading-relaxed">{selectedPracticeSession.summary}</p>
                    </div>

                    <div className="bg-cyan-500/10 border border-cyan-300/20 rounded-xl p-4">
                      <div className="text-cyan-100 text-xs mb-2">本次反馈</div>
                      <p className="text-cyan-50 leading-relaxed">{selectedPracticeSession.insight}</p>
                    </div>

                    {hasAiSummary && (
                      <div className="bg-violet-500/10 border border-violet-300/20 rounded-xl p-4 space-y-2">
                        <div className="text-violet-100 text-xs mb-1">AI 反馈摘要</div>
                        {aiSummary.encouragement && (
                          <p className="text-violet-50 text-sm leading-relaxed">鼓励：{aiSummary.encouragement}</p>
                        )}
                        {aiSummary.nextAction && (
                          <p className="text-violet-50 text-sm leading-relaxed">下一步：{aiSummary.nextAction}</p>
                        )}
                        {aiSummary.followUpQuestion && (
                          <p className="text-violet-100/90 text-sm leading-relaxed">追问：{aiSummary.followUpQuestion}</p>
                        )}
                        {aiSummary.riskReason && (
                          <p className="text-amber-100 text-xs leading-relaxed">
                            风险提醒（{formatMetadataValue(aiSummary.riskFlag, 'aiRiskFlag') || '未分级'}）：{aiSummary.riskReason}
                          </p>
                        )}
                      </div>
                    )}

                    {getPracticeMetadataItems(selectedPracticeSession.metadata).length > 0 && (
                      <div>
                        <div className="text-white/80 text-sm mb-3">扩展信息</div>
                        <div className="space-y-2">
                          {getPracticeMetadataItems(selectedPracticeSession.metadata).map((item) => (
                            <div key={item.key} className="bg-white/5 rounded-xl p-3 border border-white/10">
                              <div className="text-white/55 text-xs mb-1">{item.label}</div>
                              <div className="text-white/90 text-sm leading-relaxed">{item.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-3 pt-2">
                      <button
                        onClick={closePracticeDetailModal}
                        className="flex-1 py-3 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-colors"
                      >
                        关闭
                      </button>
                      <button
                        onClick={handleDeletePracticeSession}
                        className="flex-1 py-3 bg-red-500/20 rounded-xl text-red-200 hover:bg-red-500/30 transition-colors"
                      >
                        删除记录
                      </button>
                    </div>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}

export default HistoryPage
