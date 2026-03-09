import { useEffect, useMemo, useState } from 'react'
import OptimizedParticleBackground from './OptimizedParticleBackground'
import PracticeTags from './PracticeTags'
import {
  getActAnalytics,
  getCbtAnalytics,
  getMoodSummary,
  getMoodTrendData,
} from '../lib/journalAnalytics'
import {
  getJournalEntries,
  JOURNAL_STORAGE_UPDATED_EVENT,
} from '../lib/journalStorage'
import {
  getPracticeSessions,
  PRACTICE_STORAGE_UPDATED_EVENT,
} from '../lib/practiceStorage'
import {
  THINKING_GAME_IDS,
  THINKING_GAME_PROGRESS_UPDATED_EVENT,
  createThinkingGameProgressState,
  getThinkingGameProgress,
} from '../lib/thinkingGameProgress'
import { BOTTOM_SAFE_PADDING } from '../lib/layoutConstants'

const PRACTICE_TYPE_META = {
  thinking_game: {
    label: '思维游戏',
    icon: '🎮',
    toneClass: 'bg-violet-500/15 text-violet-100 border-violet-300/25',
    barClass: 'from-violet-400 to-fuchsia-400',
  },
  daily_journey: {
    label: '每日旅程',
    icon: '🧭',
    toneClass: 'bg-emerald-500/15 text-emerald-100 border-emerald-300/25',
    barClass: 'from-emerald-400 to-teal-400',
  },
  sos: {
    label: 'SOS练习',
    icon: '🫶',
    toneClass: 'bg-rose-500/15 text-rose-100 border-rose-300/25',
    barClass: 'from-rose-400 to-orange-400',
  },
  guided_exercise: {
    label: '引导练习',
    icon: '🌿',
    toneClass: 'bg-cyan-500/15 text-cyan-100 border-cyan-300/25',
    barClass: 'from-cyan-400 to-sky-400',
  },
  practice: {
    label: '练习记录',
    icon: '✨',
    toneClass: 'bg-white/10 text-white/70 border-white/20',
    barClass: 'from-slate-300 to-slate-100',
  },
}

const THINKING_GAME_META = {
  bubble: '思维泡泡',
  train: '思维列车',
  gratitude: '感谢大脑',
  voice: '滑稽声音',
  leaves: '溪流叶子',
}

const THINKING_GAME_LEVELS = ['新手', '进阶', '挑战']

const TAB_META = {
  mood: {
    title: '情绪趋势',
    description: '查看最近日志中的心情、压力与记录密度变化。',
  },
  cbt: {
    title: 'CBT分析',
    description: '聚焦想法模式、认知陷阱与核心信念的变化轨迹。',
  },
  act: {
    title: 'ACT洞察',
    description: '观察价值方向、行动投入与心理灵活性的连接。',
  },
  practice: {
    title: '练习记录',
    description: '汇总思维游戏、每日旅程、SOS 与引导练习的投入情况。',
  },
}

const shellCardClass = 'bg-white/10 backdrop-blur-md rounded-3xl border border-white/15 shadow-[0_12px_40px_rgba(15,23,42,0.2)]'
const sectionCardClass = 'bg-white/8 backdrop-blur-sm rounded-2xl border border-white/12 p-5 md:p-6'
const padNumber = (value) => String(value).padStart(2, '0')

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

const formatDateKey = (date) => {
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`
}

const getPracticeTypeInfo = (activityType) => {
  return PRACTICE_TYPE_META[activityType] ?? PRACTICE_TYPE_META.practice
}

const buildRecentPracticeData = (sessions) => {
  const countsByDate = sessions.reduce((map, session) => {
    const key = session.date

    if (!key) {
      return map
    }

    map.set(key, (map.get(key) ?? 0) + 1)
    return map
  }, new Map())

  const today = new Date()
  const result = []

  for (let offset = 6; offset >= 0; offset -= 1) {
    const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset)
    const key = formatDateKey(currentDate)

    result.push({
      key,
      label: `${currentDate.getMonth() + 1}/${currentDate.getDate()}`,
      count: countsByDate.get(key) ?? 0,
    })
  }

  return result
}

const buildPracticeSummary = (sessions, titleDistribution) => {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setHours(0, 0, 0, 0)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)

  const thisWeekCount = sessions.filter((session) => {
    const date = parseLocalDate(session.date)
    return date ? date >= sevenDaysAgo : false
  }).length

  const favoritePractice = titleDistribution[0]?.title ?? '—'
  const distinctPracticeCount = new Set(sessions.map((session) => session.title)).size
  const activeDays = new Set(sessions.map((session) => session.date).filter(Boolean)).size

  return {
    total: sessions.length,
    thisWeekCount,
    favoritePractice,
    distinctPracticeCount,
    activeDays,
  }
}

const buildThinkingGameSummary = (progress) => {
  const entries = THINKING_GAME_IDS.map((gameId) => ({
    gameId,
    title: THINKING_GAME_META[gameId] ?? gameId,
    ...(progress[gameId] ?? { times: 0, best: 0, level: 0 }),
  }))

  const totalRounds = entries.reduce((sum, item) => sum + item.times, 0)
  const unlockedCount = entries.filter((item) => item.times > 0).length
  const highestLevel = entries.reduce((maxLevel, item) => Math.max(maxLevel, item.level), 0)
  const highestLevelLabel = THINKING_GAME_LEVELS[highestLevel] ?? THINKING_GAME_LEVELS[0]
  const topGame = [...entries].sort((firstItem, secondItem) => secondItem.times - firstItem.times)[0] ?? null

  return {
    entries,
    totalRounds,
    unlockedCount,
    highestLevelLabel,
    topGame,
  }
}

const getLatestActiveItem = (items, keyName, activeKey, predicate = () => true) => {
  if (activeKey) {
    const matchedItem = items.find((item) => item[keyName] === activeKey)

    if (matchedItem) {
      return matchedItem
    }
  }

  const reversedItems = [...items].reverse()
  return reversedItems.find(predicate) ?? items[items.length - 1] ?? null
}

const formatSessionDate = (dateStr) => {
  const date = parseLocalDate(dateStr)

  if (!date) {
    return dateStr ?? ''
  }

  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

const MetricCard = ({ label, value, hint, accent = 'text-cyan-200' }) => (
  <div className={`${sectionCardClass} h-full`}>
    <div className="text-white/55 text-xs md:text-sm mb-2">{label}</div>
    <div className={`text-2xl md:text-3xl font-bold ${accent} leading-none mb-3 break-words`}>{value}</div>
    <div className="text-white/45 text-xs leading-relaxed">{hint}</div>
  </div>
)

const SectionHeading = ({ eyebrow, title, description }) => (
  <div className="mb-5 md:mb-6">
    {eyebrow && <div className="text-cyan-200/80 text-xs tracking-[0.24em] uppercase mb-2">{eyebrow}</div>}
    <h3 className="text-white text-lg md:text-xl font-semibold mb-2">{title}</h3>
    {description && <p className="text-white/60 text-sm leading-relaxed max-w-2xl">{description}</p>}
  </div>
)

const SectionCard = ({ title, description, icon, children, className = '' }) => (
  <div className={`${sectionCardClass} ${className}`}>
    <div className="flex items-start justify-between gap-4 mb-5">
      <div>
        <div className="text-white font-semibold text-base md:text-lg mb-1">{title}</div>
        {description && <p className="text-white/55 text-sm leading-relaxed">{description}</p>}
      </div>
      {icon && <div className="text-2xl shrink-0">{icon}</div>}
    </div>
    {children}
  </div>
)

const EmptyPanel = ({ icon, title, description }) => (
  <div className={`${shellCardClass} p-8 md:p-10 text-center`}>
    <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-2xl bg-white/10 flex items-center justify-center text-3xl md:text-4xl">
      {icon}
    </div>
    <h3 className="text-white font-semibold text-xl mb-3">{title}</h3>
    <p className="text-white/65 leading-relaxed max-w-xl mx-auto">{description}</p>
  </div>
)

const InsightPanel = ({ title, summary, points, tone = 'cyan' }) => {
  const toneClassMap = {
    cyan: 'from-cyan-500/14 to-blue-500/10 border-cyan-300/18',
    violet: 'from-violet-500/14 to-indigo-500/10 border-violet-300/18',
    emerald: 'from-emerald-500/14 to-cyan-500/10 border-emerald-300/18',
    amber: 'from-amber-500/14 to-orange-500/10 border-amber-300/18',
  }

  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-5 md:p-6 ${toneClassMap[tone] ?? toneClassMap.cyan}`}>
      <div className="text-white font-semibold text-base md:text-lg mb-2">{title}</div>
      <p className="text-white/75 text-sm leading-relaxed mb-4">{summary}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {points.map((point) => (
          <div key={point.label} className="rounded-xl bg-white/6 border border-white/10 px-4 py-3">
            <div className="text-white/45 text-xs mb-1">{point.label}</div>
            <div className="text-white text-sm leading-relaxed">{point.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const FilterChip = ({ active, icon, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full border text-sm transition-all duration-300 ${
      active
        ? 'bg-white/18 border-cyan-300/30 text-white shadow-[0_8px_24px_rgba(56,189,248,0.12)]'
        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
    }`}
  >
    <span>{icon}</span>
    <span>{label}</span>
  </button>
)

const DataVisualization = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('mood')
  const [entries, setEntries] = useState([])
  const [practiceSessions, setPracticeSessions] = useState([])
  const [thinkingGameProgress, setThinkingGameProgress] = useState(createThinkingGameProgressState)
  const [selectedPracticeType, setSelectedPracticeType] = useState('all')
  const [hoveredMoodDay, setHoveredMoodDay] = useState(null)
  const [hoveredPracticeDay, setHoveredPracticeDay] = useState(null)

  useEffect(() => {
    const syncEntries = () => {
      setEntries(getJournalEntries())
    }

    const syncPracticeSessions = () => {
      setPracticeSessions(getPracticeSessions())
    }

    const syncThinkingGameProgress = () => {
      setThinkingGameProgress(getThinkingGameProgress())
    }

    syncEntries()
    syncPracticeSessions()
    syncThinkingGameProgress()

    window.addEventListener(JOURNAL_STORAGE_UPDATED_EVENT, syncEntries)
    window.addEventListener(PRACTICE_STORAGE_UPDATED_EVENT, syncPracticeSessions)
    window.addEventListener(THINKING_GAME_PROGRESS_UPDATED_EVENT, syncThinkingGameProgress)
    window.addEventListener('storage', syncEntries)
    window.addEventListener('storage', syncPracticeSessions)
    window.addEventListener('storage', syncThinkingGameProgress)

    return () => {
      window.removeEventListener(JOURNAL_STORAGE_UPDATED_EVENT, syncEntries)
      window.removeEventListener(PRACTICE_STORAGE_UPDATED_EVENT, syncPracticeSessions)
      window.removeEventListener(THINKING_GAME_PROGRESS_UPDATED_EVENT, syncThinkingGameProgress)
      window.removeEventListener('storage', syncEntries)
      window.removeEventListener('storage', syncPracticeSessions)
      window.removeEventListener('storage', syncThinkingGameProgress)
    }
  }, [])

  useEffect(() => {
    if (entries.length === 0 && practiceSessions.length > 0 && activeTab !== 'practice') {
      setActiveTab('practice')
      return
    }

    if (activeTab === 'practice' && practiceSessions.length === 0 && entries.length > 0) {
      setActiveTab('mood')
    }
  }, [activeTab, entries.length, practiceSessions.length])

  const moodData = useMemo(() => getMoodTrendData(entries), [entries])
  const moodSummary = useMemo(() => getMoodSummary(entries), [entries])
  const cbtData = useMemo(() => getCbtAnalytics(entries), [entries])
  const actData = useMemo(() => getActAnalytics(entries), [entries])

  const practiceTypeDistribution = useMemo(() => {
    const counts = practiceSessions.reduce((map, session) => {
      const key = session.activityType ?? 'practice'

      map.set(key, (map.get(key) ?? 0) + 1)
      return map
    }, new Map())

    return [...counts.entries()]
      .map(([activityType, count]) => ({
        activityType,
        count,
        ...getPracticeTypeInfo(activityType),
      }))
      .sort((firstItem, secondItem) => secondItem.count - firstItem.count)
  }, [practiceSessions])

  const practiceFilterOptions = useMemo(() => {
    return [{ activityType: 'all', label: '全部练习', icon: '✨' }, ...practiceTypeDistribution]
  }, [practiceTypeDistribution])

  useEffect(() => {
    if (selectedPracticeType === 'all') {
      return
    }

    if (!practiceTypeDistribution.some((item) => item.activityType === selectedPracticeType)) {
      setSelectedPracticeType('all')
    }
  }, [practiceTypeDistribution, selectedPracticeType])

  const filteredPracticeSessions = useMemo(() => {
    if (selectedPracticeType === 'all') {
      return practiceSessions
    }

    return practiceSessions.filter((session) => (session.activityType ?? 'practice') === selectedPracticeType)
  }, [practiceSessions, selectedPracticeType])

  const filteredPracticeTrendData = useMemo(() => buildRecentPracticeData(filteredPracticeSessions), [filteredPracticeSessions])

  const filteredPracticeTypeDistribution = useMemo(() => {
    const counts = filteredPracticeSessions.reduce((map, session) => {
      const key = session.activityType ?? 'practice'

      map.set(key, (map.get(key) ?? 0) + 1)
      return map
    }, new Map())

    return [...counts.entries()]
      .map(([activityType, count]) => ({
        activityType,
        count,
        ...getPracticeTypeInfo(activityType),
      }))
      .sort((firstItem, secondItem) => secondItem.count - firstItem.count)
  }, [filteredPracticeSessions])

  const filteredPracticeTitleDistribution = useMemo(() => {
    const counts = filteredPracticeSessions.reduce((map, session) => {
      const title = session.title ?? '练习记录'
      const activityType = session.activityType ?? 'practice'
      const current = map.get(title) ?? {
        title,
        count: 0,
        typeCounts: new Map(),
      }

      current.count += 1
      current.typeCounts.set(activityType, (current.typeCounts.get(activityType) ?? 0) + 1)
      map.set(title, current)

      return map
    }, new Map())

    return [...counts.values()]
      .map((item) => {
        const topType = [...item.typeCounts.entries()]
          .sort((firstItem, secondItem) => secondItem[1] - firstItem[1])[0]?.[0] ?? 'practice'

        return {
          title: item.title,
          count: item.count,
          activityType: topType,
          ...getPracticeTypeInfo(topType),
        }
      })
      .sort((firstItem, secondItem) => secondItem.count - firstItem.count)
  }, [filteredPracticeSessions])

  const practiceSummary = useMemo(
    () => buildPracticeSummary(filteredPracticeSessions, filteredPracticeTitleDistribution),
    [filteredPracticeSessions, filteredPracticeTitleDistribution],
  )
  const thinkingGameSummary = useMemo(() => buildThinkingGameSummary(thinkingGameProgress), [thinkingGameProgress])
  const maxPracticeTitleCount = filteredPracticeTitleDistribution[0]?.count ?? 1

  const recentPracticeSessions = useMemo(() => filteredPracticeSessions.slice(0, 3), [filteredPracticeSessions])

  const selectedMoodPoint = useMemo(() => {
    return getLatestActiveItem(moodData, 'fullDate', hoveredMoodDay, (item) => item.count > 0)
  }, [hoveredMoodDay, moodData])

  const selectedPracticePoint = useMemo(() => {
    return getLatestActiveItem(filteredPracticeTrendData, 'key', hoveredPracticeDay, (item) => item.count > 0)
  }, [filteredPracticeTrendData, hoveredPracticeDay])

  const topTrap = cbtData.cognitiveTraps[0]
  const strengths = cbtData.beliefStrength.filter((item) => item.strength > 0)
  const firstStrength = strengths[0]?.strength ?? 0
  const lastStrength = strengths[strengths.length - 1]?.strength ?? 0
  const beliefDelta = strengths.length > 1 ? lastStrength - firstStrength : 0

  const mostAlignedValue = [...actData.values].sort((firstItem, secondItem) => secondItem.action - firstItem.action)[0]
  const flexibilityScores = actData.psychologicalFlexibility.map((item) => item.score).filter((score) => score > 0)
  const averageFlexibility = flexibilityScores.length > 0
    ? Math.round(flexibilityScores.reduce((sum, score) => sum + score, 0) / flexibilityScores.length)
    : 0

  const tabs = [
    { id: 'mood', label: '情绪趋势', icon: '📊' },
    { id: 'cbt', label: 'CBT分析', icon: '🧠' },
    { id: 'act', label: 'ACT洞察', icon: '🎯' },
    { id: 'practice', label: '练习记录', icon: '🎮' },
  ]

  const hasEntries = entries.length > 0
  const hasPracticeSessions = practiceSessions.length > 0
  const hasAnyData = hasEntries || hasPracticeSessions
  const maxTrapCount = Math.max(...cbtData.cognitiveTraps.map((item) => item.count), 1)
  const activeTabMeta = TAB_META[activeTab]
  const currentPracticeFilter = practiceFilterOptions.find((option) => option.activityType === selectedPracticeType) ?? practiceFilterOptions[0]

  const heroMetrics = [
    {
      label: '日志记录',
      value: entries.length,
      hint: '已写入的数据样本',
      accent: 'text-emerald-300',
    },
    {
      label: '练习次数',
      value: practiceSessions.length,
      hint: '已接入的练习完成记录',
      accent: 'text-cyan-300',
    },
    {
      label: '思维游戏轮次',
      value: thinkingGameSummary.totalRounds,
      hint: `已解锁 ${thinkingGameSummary.unlockedCount}/${THINKING_GAME_IDS.length} 项`,
      accent: 'text-teal-300',
    },
    {
      label: '当前视图',
      value: activeTabMeta?.title ?? '数据概览',
      hint: activeTabMeta?.description ?? '从不同角度查看你的变化。',
      accent: 'text-violet-300',
    },
  ]
  const renderEmptyState = () => (
    <EmptyPanel
      icon="📓"
      title="还没有可分析的数据"
      description="先去记录几篇情绪日志，或完成几次练习，这里就会自动生成趋势图、压力分析与练习投入概览。"
    />
  )

  const renderTabEmptyState = (title, description, icon) => (
    <EmptyPanel icon={icon} title={title} description={description} />
  )

  const renderMoodChart = () => (
    <div className="space-y-8">
      <InsightPanel
        title="情绪趋势解读"
        summary={selectedMoodPoint?.count > 0
          ? `当前聚焦 ${selectedMoodPoint.date}：这一天记录了 ${selectedMoodPoint.count} 条日志，心情与压力的波动已经能看出一些节奏。`
          : '这周里有些天还没有留下日志，继续记录会让趋势更完整。'}
        tone="emerald"
        points={[
          { label: '聚焦日期', value: selectedMoodPoint?.date ?? '—' },
          { label: '心情综合分', value: selectedMoodPoint ? `${selectedMoodPoint.mood}` : '—' },
          { label: '压力分', value: selectedMoodPoint ? `${selectedMoodPoint.anxiety}` : '—' },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        <MetricCard label="平均心情" value={moodSummary.averageMood || '--'} hint="根据近期日志自动计算的心情均值" accent="text-emerald-300" />
        <MetricCard label="平均压力" value={moodSummary.averageAnxiety || '--'} hint="越稳定记录，压力趋势越容易看清" accent="text-rose-300" />
        <MetricCard label="记录天数" value={moodSummary.recordedDays} hint="持续记录能让后续洞察更可靠" accent="text-sky-300" />
      </div>

      <SectionCard title="7天情绪趋势" description="把鼠标移到柱体上，可以更直观看当前日期的状态。" icon="📈">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-5 items-start">
          <div className="bg-white/5 rounded-2xl p-4 md:p-6 overflow-x-auto">
            <div className="min-w-[560px] h-64 flex items-end justify-between gap-4">
              {moodData.map((day) => {
                const isActive = selectedMoodPoint?.fullDate === day.fullDate

                return (
                  <div
                    key={day.fullDate}
                    className="flex-1 h-full flex flex-col items-center justify-end gap-3 cursor-default"
                    onMouseEnter={() => setHoveredMoodDay(day.fullDate)}
                    onMouseLeave={() => setHoveredMoodDay(null)}
                  >
                    <div className={`text-xs font-medium transition-colors ${isActive ? 'text-white' : 'text-white/70'}`}>{day.count} 条</div>
                    <div className="h-full flex flex-col justify-end gap-1.5">
                      <div
                        className={`w-7 md:w-8 bg-gradient-to-t from-emerald-500 to-green-300 rounded-t-2xl transition-all duration-300 ${isActive ? 'shadow-[0_0_20px_rgba(52,211,153,0.45)]' : ''}`}
                        style={{ height: `${Math.max(day.mood * 10, day.count > 0 ? 18 : 6)}px`, opacity: day.count > 0 ? (isActive ? 1 : 0.85) : 0.22 }}
                      />
                      <div
                        className={`w-7 md:w-8 bg-gradient-to-t from-pink-500 to-rose-300 rounded-b-2xl transition-all duration-300 ${isActive ? 'shadow-[0_0_20px_rgba(244,114,182,0.35)]' : ''}`}
                        style={{ height: `${Math.max(day.anxiety * 8, day.count > 0 ? 16 : 6)}px`, opacity: day.count > 0 ? (isActive ? 1 : 0.85) : 0.22 }}
                      />
                    </div>
                    <div className={`text-xs transition-colors ${isActive ? 'text-white' : 'text-white/60'}`}>{day.date}</div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-4">
            <div>
              <div className="text-white/45 text-xs mb-1">当前聚焦</div>
              <div className="text-white font-medium">{selectedMoodPoint?.date ?? '暂无数据'}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/6 p-3">
                <div className="text-white/45 text-xs mb-1">心情</div>
                <div className="text-emerald-300 text-xl font-semibold">{selectedMoodPoint?.mood ?? '--'}</div>
              </div>
              <div className="rounded-xl bg-white/6 p-3">
                <div className="text-white/45 text-xs mb-1">压力</div>
                <div className="text-rose-300 text-xl font-semibold">{selectedMoodPoint?.anxiety ?? '--'}</div>
              </div>
            </div>
            <div className="rounded-xl bg-white/6 p-3">
              <div className="text-white/45 text-xs mb-1">日志数</div>
              <div className="text-white text-lg font-medium">{selectedMoodPoint?.count ?? 0} 条</div>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  )

  const renderCBTChart = () => {
    return (
      <div className="space-y-8">
        <InsightPanel
          title="CBT 观察摘要"
          summary={beliefDelta <= 0
            ? '最近的核心信念强度没有继续上升，这通常说明你开始能更快看见自动化想法。'
            : '最近的核心信念仍然偏强，可以继续记录触发场景与替代想法。'}
          tone="amber"
          points={[
            { label: '高频想法', value: cbtData.thoughtPattern || '继续记录后会出现' },
            { label: '主要陷阱', value: topTrap ? `${topTrap.trap}（${topTrap.count}次）` : '继续记录后会出现' },
            { label: '4周变化', value: strengths.length > 1 ? `${beliefDelta > 0 ? '+' : ''}${beliefDelta}%` : '样本不足' },
          ]}
        />

        <SectionCard title="核心信念强度变化" description="观察同一类自动化想法在最近几周的强度波动。" icon="📉">
          <div className="bg-white/5 rounded-2xl p-5 md:p-6 mb-4">
            <div className="text-white/60 text-sm mb-2">当前高频想法</div>
            <div className="text-white text-lg font-medium mb-5">“{cbtData.thoughtPattern}”</div>

            <div className="overflow-x-auto">
              <div className="min-w-[420px] h-52 flex items-end justify-between gap-5">
                {cbtData.beliefStrength.map((week) => (
                  <div key={week.week} className="flex-1 h-full flex flex-col items-center justify-end gap-3">
                    <div className="text-white/80 text-xs font-medium">{week.strength || 0}%</div>
                    <div
                      className="w-9 bg-gradient-to-t from-orange-500 to-yellow-300 rounded-t-2xl"
                      style={{ height: `${Math.max(week.strength, 10)}px`, opacity: week.strength > 0 ? 1 : 0.22 }}
                    />
                    <div className="text-white/60 text-xs">{week.week}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-white/55 text-xs mb-1">变化结果</div>
              <div className={`${beliefDelta <= 0 ? 'text-emerald-300' : 'text-yellow-300'} text-lg font-semibold`}>
                {strengths.length > 1 ? `最近4周 ${beliefDelta > 0 ? '+' : ''}${beliefDelta}%` : '继续记录后可看到变化'}
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-white/55 text-xs mb-1">提示</div>
              <div className="text-white/80 text-sm leading-relaxed">当你开始辨认一个模式，它通常就不再像以前那样自动主导你。</div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="认知陷阱分布" description="看看最近最常出现的是哪几类思维偏差。" icon="🕳️">
          <div className="space-y-4">
            {cbtData.cognitiveTraps.map((trap) => (
              <div key={trap.trap} className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/85 text-sm font-medium">{trap.trap}</span>
                  <span className="text-white/50 text-xs">{trap.count} 次</span>
                </div>
                <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-400 to-indigo-400 rounded-full"
                    style={{ width: `${(trap.count / maxTrapCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    )
  }

  const renderACTChart = () => {
    const maxFlexibility = Math.max(...actData.psychologicalFlexibility.map((item) => item.score), 1)

    return (
      <div className="space-y-8">
        <InsightPanel
          title="ACT 方向提醒"
          summary={mostAlignedValue
            ? `你当前最投入的方向是“${mostAlignedValue.value}”，这说明你已经在把价值观慢慢转成可执行的行动。`
            : '继续写下价值方向和行动计划，这里会更清楚地显示你的价值轨迹。'}
          tone="violet"
          points={[
            { label: '最高投入', value: mostAlignedValue ? `${mostAlignedValue.value}（${mostAlignedValue.action}/10）` : '暂无' },
            { label: '平均灵活性', value: averageFlexibility > 0 ? `${averageFlexibility}` : '暂无' },
            { label: '价值项目数', value: `${actData.values.length}` },
          ]}
        />

        <SectionCard title="价值观对齐分析" description="重要的方向，是否真的有行动在跟进。" icon="🎯">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {actData.values.map((item) => (
              <div key={item.value} className="bg-white/5 rounded-2xl p-4 md:p-5">
                <div className="text-white font-medium mb-4">{item.value}</div>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm text-white/70 mb-2">
                      <span>重要性</span>
                      <span className="text-cyan-200">{item.importance}/10</span>
                    </div>
                    <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full" style={{ width: `${item.importance * 10}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm text-white/70 mb-2">
                      <span>行动投入</span>
                      <span className="text-emerald-200">{item.action}/10</span>
                    </div>
                    <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-green-300 rounded-full" style={{ width: `${item.action * 10}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="心理灵活性趋势" description="数值越高，代表你越能在情绪存在时仍继续靠近自己想要的方向。" icon="🌱">
          <div className="bg-white/5 rounded-2xl p-4 md:p-6 overflow-x-auto">
            <div className="min-w-[420px] h-52 flex items-end justify-between gap-5">
              {actData.psychologicalFlexibility.map((week) => (
                <div key={week.week} className="flex-1 h-full flex flex-col items-center justify-end gap-3">
                  <div className="text-white/80 text-xs font-medium">{week.score || 0}</div>
                  <div
                    className="w-9 bg-gradient-to-t from-cyan-500 to-emerald-300 rounded-t-2xl"
                    style={{ height: `${Math.max((week.score / maxFlexibility) * 150, week.score > 0 ? 12 : 6)}px`, opacity: week.score > 0 ? 1 : 0.22 }}
                  />
                  <div className="text-white/60 text-xs">{week.week}</div>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>
    )
  }
  const renderPracticeChart = () => {
    const maxPracticeCount = Math.max(...filteredPracticeTrendData.map((item) => item.count), 1)

    if (!hasPracticeSessions) {
      return renderTabEmptyState(
        '还没有练习记录',
        '完成一次思维游戏、每日旅程、SOS 练习或引导练习后，这里会自动汇总你的投入情况。',
        '🎮',
      )
    }

    return (
      <div className="space-y-8">
        <InsightPanel
          title="练习投入反馈"
          summary={selectedPracticeType === 'all'
            ? '你已经把不同练习接入到同一个面板里了，现在可以继续观察哪种方式最适合自己。'
            : `当前正在查看“${currentPracticeFilter.label}”这一类练习，下面的热度、最近完成和高频项目都会跟着筛选联动。`}
          tone="cyan"
          points={[
            { label: '当前筛选', value: currentPracticeFilter.label },
            { label: '近7天次数', value: `${practiceSummary.thisWeekCount}` },
            { label: '最常使用', value: practiceSummary.favoritePractice },
          ]}
        />

        <SectionCard title="练习筛选" description="按练习类型切换，下面的数据会一起联动更新。" icon="🧭">
          <div className="flex flex-wrap gap-2.5">
            {practiceFilterOptions.map((option) => (
              <FilterChip
                key={option.activityType}
                active={selectedPracticeType === option.activityType}
                icon={option.icon}
                label={option.label}
                onClick={() => setSelectedPracticeType(option.activityType)}
              />
            ))}
          </div>
        </SectionCard>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
          <MetricCard label="累计练习" value={practiceSummary.total} hint="当前筛选下的完成记录总量" accent="text-cyan-300" />
          <MetricCard label="近7天练习" value={practiceSummary.thisWeekCount} hint="连续出现比偶尔爆发更重要" accent="text-emerald-300" />
          <MetricCard label="已尝试项目" value={practiceSummary.distinctPracticeCount} hint={`已覆盖 ${practiceSummary.activeDays} 个活跃日`} accent="text-violet-300" />
          <MetricCard label="最常使用" value={practiceSummary.favoritePractice} hint="这是你当前筛选下最熟悉的调节路径" accent="text-sky-300" />
        </div>

        {(selectedPracticeType === 'all' || selectedPracticeType === 'thinking_game') && (
          <SectionCard title="思维游戏成长进度" description="这里展示的是动态难度系统累计下来的游戏进度。" icon="🕹️">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 mb-4">
              <div className="bg-white/5 rounded-xl border border-white/10 px-4 py-3">
                <div className="text-white/45 text-xs mb-1">累计轮次</div>
                <div className="text-cyan-200 text-lg font-semibold">{thinkingGameSummary.totalRounds}</div>
              </div>
              <div className="bg-white/5 rounded-xl border border-white/10 px-4 py-3">
                <div className="text-white/45 text-xs mb-1">已解锁游戏</div>
                <div className="text-emerald-200 text-lg font-semibold">{thinkingGameSummary.unlockedCount}/{THINKING_GAME_IDS.length}</div>
              </div>
              <div className="bg-white/5 rounded-xl border border-white/10 px-4 py-3">
                <div className="text-white/45 text-xs mb-1">最高难度</div>
                <div className="text-violet-200 text-lg font-semibold">{thinkingGameSummary.highestLevelLabel}</div>
              </div>
              <div className="bg-white/5 rounded-xl border border-white/10 px-4 py-3">
                <div className="text-white/45 text-xs mb-1">最高频项目</div>
                <div className="text-sky-200 text-sm font-semibold">
                  {thinkingGameSummary.topGame && thinkingGameSummary.topGame.times > 0
                    ? `${thinkingGameSummary.topGame.title}（${thinkingGameSummary.topGame.times}次）`
                    : '暂无'}
                </div>
              </div>
            </div>

            {thinkingGameSummary.totalRounds > 0 ? (
              <div className="space-y-3">
                {thinkingGameSummary.entries.map((item) => {
                  const levelPercent = ((item.level + 1) / THINKING_GAME_LEVELS.length) * 100
                  const levelLabel = THINKING_GAME_LEVELS[item.level] ?? THINKING_GAME_LEVELS[0]

                  return (
                    <div key={item.gameId} className="bg-white/5 rounded-xl border border-white/10 p-4">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="text-white text-sm font-medium">{item.title}</div>
                        <div className="text-white/55 text-xs">{item.times} 次 · 最佳 {item.best}</div>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 rounded-full" style={{ width: `${levelPercent}%` }} />
                      </div>
                      <div className="text-white/60 text-xs">当前难度：{levelLabel}</div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-white/60 text-sm">
                还没有思维游戏进度。完成一轮后，这里会自动展示你的等级和练习积累。
              </div>
            )}
          </SectionCard>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[1.55fr_1fr] gap-6">
          <SectionCard title="近7天练习热度" description="把鼠标移到柱体上，可以快速查看某一天的投入情况。" icon="📆">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-5 items-start">
              <div className="bg-white/5 rounded-2xl p-4 md:p-6 overflow-x-auto">
                <div className="min-w-[520px] h-64 flex items-end justify-between gap-4">
                  {filteredPracticeTrendData.map((day) => {
                    const isActive = selectedPracticePoint?.key === day.key

                    return (
                      <div
                        key={day.key}
                        className="flex-1 h-full flex flex-col items-center justify-end gap-3 cursor-default"
                        onMouseEnter={() => setHoveredPracticeDay(day.key)}
                        onMouseLeave={() => setHoveredPracticeDay(null)}
                      >
                        <div className={`text-xs font-medium transition-colors ${isActive ? 'text-white' : 'text-white/70'}`}>{day.count}</div>
                        <div className="h-full flex items-end justify-center">
                          <div
                            className={`w-8 md:w-9 bg-gradient-to-t from-cyan-500 via-blue-400 to-violet-400 rounded-t-2xl transition-all duration-300 ${isActive ? 'shadow-[0_0_24px_rgba(96,165,250,0.35)]' : ''}`}
                            style={{ height: `${Math.max((day.count / maxPracticeCount) * 165, day.count > 0 ? 18 : 6)}px`, opacity: day.count > 0 ? (isActive ? 1 : 0.85) : 0.22 }}
                          />
                        </div>
                        <div className={`text-xs transition-colors ${isActive ? 'text-white' : 'text-white/60'}`}>{day.label}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-4">
                <div>
                  <div className="text-white/45 text-xs mb-1">当前聚焦</div>
                  <div className="text-white font-medium">{selectedPracticePoint?.label ?? '暂无数据'}</div>
                </div>
                <div className="rounded-xl bg-white/6 p-3">
                  <div className="text-white/45 text-xs mb-1">完成次数</div>
                  <div className="text-cyan-300 text-xl font-semibold">{selectedPracticePoint?.count ?? 0}</div>
                </div>
                <div className="rounded-xl bg-white/6 p-3">
                  <div className="text-white/45 text-xs mb-1">筛选范围</div>
                  <div className="text-white text-sm">{currentPracticeFilter.label}</div>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="练习类型分布" description="看你最近更偏向哪类调节方式。" icon="🧩">
            <div className="space-y-4">
              {filteredPracticeTypeDistribution.map((item) => {
                const percent = practiceSummary.total > 0 ? Math.round((item.count / practiceSummary.total) * 100) : 0

                return (
                  <div key={item.activityType} className="bg-white/5 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[11px] ${item.toneClass}`}>
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                        </span>
                      </div>
                      <span className="text-cyan-200 text-xs">{item.count} 次 · {percent}%</span>
                    </div>
                    <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${item.barClass} rounded-full`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </SectionCard>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6">
          <SectionCard title="最近完成" description="展示最近几次已经落地的练习，而不是把所有内容揉成一团。" icon="🕒">
            <div className="space-y-4">
              {recentPracticeSessions.map((session) => {
                const typeInfo = getPracticeTypeInfo(session.activityType)

                return (
                  <div key={session.id} className="bg-white/5 rounded-2xl p-4 md:p-5 border border-white/8">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span>{typeInfo.icon}</span>
                          <span className="text-white font-medium">{session.title}</span>
                        </div>
                        <div className="text-white/45 text-xs">{typeInfo.label}</div>
                      </div>
                      <div className="text-white/45 text-xs text-right leading-relaxed">
                        {formatSessionDate(session.date)}
                        <br />
                        {session.time}
                      </div>
                    </div>
                    <p className="text-white/75 text-sm leading-relaxed mb-2">{session.summary}</p>
                    <p className="text-cyan-100/85 text-xs leading-relaxed">{session.insight}</p>
                    <PracticeTags session={session} className="mt-3" />
                  </div>
                )
              })}
            </div>
          </SectionCard>

          <SectionCard title="高频练习项目" description="最常出现的项目，通常也代表你最熟悉的自助入口。" icon="🌟">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3">
              {filteredPracticeTitleDistribution.slice(0, 6).map((item, index) => {
                const percent = Math.round((item.count / maxPracticeTitleCount) * 100)

                return (
                  <div key={item.title} className="bg-white/5 rounded-xl p-4 border border-white/8">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="text-white font-medium text-sm">{item.title}</div>
                      <div className="text-white/40 text-xs">No.{index + 1}</div>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[11px] ${item.toneClass}`}>
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </span>
                      <span className="text-white/55 text-xs">{item.count} 次</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${item.barClass} rounded-full`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </SectionCard>
        </div>
      </div>
    )
  }

  const renderActiveTab = () => {
    if (activeTab === 'practice') {
      return renderPracticeChart()
    }

    if (!hasEntries) {
      return renderTabEmptyState(
        '还没有日志数据',
        '先去写一篇情绪日志，这里才能生成趋势图、认知分析和价值观洞察。',
        '📓',
      )
    }

    if (activeTab === 'mood') {
      return renderMoodChart()
    }

    if (activeTab === 'cbt') {
      return renderCBTChart()
    }

    return renderACTChart()
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url("/src/assets/history-bg.webp")`,
          filter: 'brightness(0.72)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-purple-950/55 to-slate-950/85" />

      <OptimizedParticleBackground color="#8B5CF6" quantity={6} />

      <div
        className="relative z-10 min-h-screen px-4 pt-5 pb-28 md:px-6 md:pt-6"
        style={{ paddingBottom: BOTTOM_SAFE_PADDING, scrollPaddingBottom: BOTTOM_SAFE_PADDING }}
      >
        <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors px-3 py-2 rounded-full bg-white/8 hover:bg-white/12"
            >
              <span className="text-xl">←</span>
              <span>返回</span>
            </button>
            <div className="text-white/55 text-sm">数据可视化</div>
          </div>

          <div className={`${shellCardClass} p-5 md:p-7 lg:p-8`}>
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 lg:gap-8 items-start">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-300/20 text-cyan-100 text-xs mb-4">
                  <span>📊</span>
                  <span>成长数据面板</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">你的情绪与练习地图</h1>
                <p className="text-white/65 leading-relaxed max-w-2xl">
                  我继续把这页完善成更可读、也更可交互的面板：不仅能看图，还能快速读懂“这组数据现在说明了什么”。
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
                {heroMetrics.map((item) => (
                  <div key={item.label} className="bg-white/6 rounded-2xl border border-white/10 px-4 py-4">
                    <div className="text-white/50 text-xs mb-2">{item.label}</div>
                    <div className={`text-xl md:text-2xl font-semibold ${item.accent} mb-2 break-words`}>
                      {item.value}
                    </div>
                    <div className="text-white/40 text-xs leading-relaxed">{item.hint}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={`${shellCardClass} p-3 md:p-4`}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-2xl px-4 py-4 text-left transition-all duration-300 border ${
                    activeTab === tab.id
                      ? 'bg-white/18 border-cyan-300/30 shadow-[0_10px_30px_rgba(56,189,248,0.12)]'
                      : 'bg-white/4 border-white/8 hover:bg-white/10'
                  }`}
                >
                  <div className="text-xl mb-2">{tab.icon}</div>
                  <div className="text-white font-medium text-sm md:text-base">{tab.label}</div>
                </button>
              ))}
            </div>
          </div>

          {hasAnyData && (
            <div className={`${shellCardClass} p-5 md:p-6`}>
              <SectionHeading
                eyebrow="Focus"
                title={activeTabMeta?.title ?? '数据概览'}
                description={activeTabMeta?.description ?? '从不同角度阅读你的变化轨迹。'}
              />
              {renderActiveTab()}
            </div>
          )}

          {!hasAnyData && renderEmptyState()}
          <div className="h-3 md:h-5" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}

export default DataVisualization
