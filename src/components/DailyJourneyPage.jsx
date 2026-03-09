import { useEffect, useMemo, useState } from 'react'
import OptimizedParticleBackground from './OptimizedParticleBackground'
import ThinkingDetective from './ThinkingDetective'
import ValueCompass from './ValueCompass'
import ThinkingGames from './ThinkingGames'
import {
  recordThinkingDetectiveSession,
  recordValueCompassSession,
} from '../lib/practiceHelpers'
import {
  getPracticeSessions,
  PRACTICE_STORAGE_UPDATED_EVENT,
} from '../lib/practiceStorage'

const dailyActivities = [
  {
    id: 'detective',
    title: '思维侦探日志',
    subtitle: 'CBT认知行为疗法',
    description: '通过引导式提问分析和重构自动化思维',
    icon: '🔍',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-blue-400/30',
    duration: '8-10分钟',
    type: 'CBT',
    focusTitle: '识别自动化想法，练习把情绪和事实分开看',
    previewTitle: '你将完成这些步骤',
    previewSteps: [
      '记录当下最困扰你的事件和念头',
      '识别其中可能存在的思维陷阱',
      '用更平衡、更贴近事实的方式重写想法',
    ],
    outcomes: [
      '更快看见情绪背后的触发点',
      '减少“越想越糟”的自动循环',
      '为后续日志和洞察积累更清晰的数据',
    ],
    hint: '适合情绪起伏较大、脑子里反复打转的时候使用。',
  },
  {
    id: 'compass',
    title: '价值罗盘',
    subtitle: 'ACT接纳承诺疗法',
    description: '探索内在价值观并设定具体行动',
    icon: '🧭',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'from-purple-500/20 to-pink-500/20',
    borderColor: 'border-purple-400/30',
    duration: '6-8分钟',
    type: 'ACT',
    focusTitle: '把“我在意什么”变成今天真正能做到的一步',
    previewTitle: '你将完成这些步骤',
    previewSteps: [
      '从多个生活维度中选出最重要的价值方向',
      '辨别自己重视的事情与当下行为是否一致',
      '设定一个可执行、可完成的今日行动',
    ],
    outcomes: [
      '从“我该怎么办”转向“我想成为什么样的人”',
      '减少空转和拖延，提升行动感',
      '让后续洞察能看到你的价值观投入趋势',
    ],
    hint: '适合迷茫、拖延，或者想把生活重新拉回正轨时使用。',
  },
  {
    id: 'games',
    title: '思维游戏',
    subtitle: 'ACT认知解离练习',
    description: '通过游戏化练习与想法拉开距离',
    icon: '🎮',
    color: 'from-green-500 to-teal-500',
    bgColor: 'from-green-500/20 to-teal-500/20',
    borderColor: 'border-green-400/30',
    duration: '5-7分钟',
    type: 'ACT',
    focusTitle: '练习把想法当作“脑中内容”，而不是必须服从的命令',
    previewTitle: '你将体验这些内容',
    previewSteps: [
      '用“思维泡泡”看见想法出现又离开',
      '用“思维列车”体验不必跳上每一班念头',
      '在轻量互动里练习与想法保持距离',
    ],
    outcomes: [
      '降低负面想法的粘性和压迫感',
      '更容易从情绪反应切回当下',
      '为焦虑、内耗、过度思考提供快速缓冲',
    ],
    hint: '适合压力上头、脑内噪音很多，但暂时不想做深度书写时使用。',
  },
]

const padNumber = (value) => String(value).padStart(2, '0')

const formatDateKey = (date) => {
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`
}

const DailyJourneyPage = ({ onBack }) => {
  const [previewActivityId, setPreviewActivityId] = useState(dailyActivities[0].id)
  const [activeActivityId, setActiveActivityId] = useState(null)
  const [completedToday, setCompletedToday] = useState(new Set())
  const [currentDate] = useState(new Date().toDateString())
  const [todayDateKey] = useState(() => formatDateKey(new Date()))

  const selectedActivity = useMemo(
    () => dailyActivities.find((activity) => activity.id === previewActivityId) ?? dailyActivities[0],
    [previewActivityId],
  )

  const markAsCompleted = (activityId) => {
    const key = `${activityId}_${currentDate}`
    localStorage.setItem(key, 'completed')
    setCompletedToday((prev) => new Set([...prev, activityId]))
  }

  useEffect(() => {
    const syncCompletedToday = () => {
      const completed = new Set()

      dailyActivities.forEach((activity) => {
        const key = `${activity.id}_${currentDate}`

        if (localStorage.getItem(key) === 'completed') {
          completed.add(activity.id)
        }
      })

      getPracticeSessions().forEach((session) => {
        if (session.date !== todayDateKey) {
          return
        }

        if (session.activityType === 'thinking_game') {
          completed.add('games')
          return
        }

        if (session.activityType === 'daily_journey') {
          if (session.activityId === 'detective' || session.activityId === 'compass' || session.activityId === 'games') {
            completed.add(session.activityId)
          }
        }
      })

      setCompletedToday(completed)
    }

    syncCompletedToday()
    window.addEventListener(PRACTICE_STORAGE_UPDATED_EVENT, syncCompletedToday)
    window.addEventListener('storage', syncCompletedToday)

    return () => {
      window.removeEventListener(PRACTICE_STORAGE_UPDATED_EVENT, syncCompletedToday)
      window.removeEventListener('storage', syncCompletedToday)
    }
  }, [currentDate, todayDateKey])

  const handleActivityComplete = (activityId) => {
    markAsCompleted(activityId)
    setPreviewActivityId(activityId)
    setActiveActivityId(null)
  }

  const handleActivitySelect = (activityId) => {
    setPreviewActivityId(activityId)
  }

  const handleStartActivity = (activityId) => {
    setActiveActivityId(activityId)
  }

  if (activeActivityId === 'detective') {
    return (
      <ThinkingDetective
        onComplete={(responses) => {
          recordThinkingDetectiveSession(responses)
          handleActivityComplete('detective')
        }}
        onBack={() => setActiveActivityId(null)}
      />
    )
  }

  if (activeActivityId === 'compass') {
    return (
      <ValueCompass
        onComplete={(payload) => {
          recordValueCompassSession(payload)
          handleActivityComplete('compass')
        }}
        onBack={() => setActiveActivityId(null)}
      />
    )
  }

  if (activeActivityId === 'games') {
    return (
      <ThinkingGames
        onComplete={() => handleActivityComplete('games')}
        onBack={() => setActiveActivityId(null)}
      />
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-900 to-slate-900">
      <OptimizedParticleBackground color="#6366F1" quantity={12} />

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
            <h1 className="text-2xl font-bold text-white">每日旅程</h1>
            <p className="text-white/70">今天的心理健康学习</p>
          </div>

          <div className="text-white/80 text-right">
            <div className="text-sm">今日进度</div>
            <div className="text-lg font-mono">
              {completedToday.size}/{dailyActivities.length}
            </div>
          </div>
        </div>

        <div className="text-center px-6 mb-8">
          <div className="text-white/60 text-sm mb-2">
            {new Date().toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </div>
          <div className="text-white/90 text-lg">
            每天进步一点点，心理健康每一天 ✨
          </div>
        </div>

        <div className="flex-1 px-6 pb-24">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              {dailyActivities.map((activity) => {
                const isCompleted = completedToday.has(activity.id)
                const isSelected = previewActivityId === activity.id

                return (
                  <button
                    type="button"
                    key={activity.id}
                    className="relative block w-full text-left"
                    onClick={() => handleActivitySelect(activity.id)}
                  >
                    <div className={`bg-gradient-to-r ${activity.bgColor} backdrop-blur-sm rounded-2xl p-6 border transition-all duration-300 ${activity.borderColor} ${isSelected ? 'border-white/50 scale-[1.02] shadow-2xl' : 'hover:border-white/40 hover:scale-[1.01] hover:shadow-xl'}`}>
                      {isCompleted && (
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white text-sm">✓</span>
                        </div>
                      )}

                      <div className="flex items-center space-x-4">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${activity.color} flex items-center justify-center shadow-lg`}>
                          <span className="text-3xl">{activity.icon}</span>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-white font-bold text-lg">{activity.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${activity.type === 'CBT' ? 'bg-blue-500/30 text-blue-200' : 'bg-purple-500/30 text-purple-200'}`}>
                              {activity.type}
                            </span>
                          </div>
                          <p className="text-white/60 text-sm mb-2">{activity.subtitle}</p>
                          <p className="text-white/80 text-sm mb-3">{activity.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-white/60 text-xs">⏱ {activity.duration}</span>
                            {isCompleted ? (
                              <span className="text-green-400 text-xs font-medium">今日已完成</span>
                            ) : isSelected ? (
                              <span className="text-yellow-300 text-xs font-medium">已选中，查看右侧内容</span>
                            ) : (
                              <span className="text-white/40 text-xs">点击查看内容 →</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}

              {completedToday.size === dailyActivities.length && (
                <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-sm rounded-2xl p-6 border border-green-400/30 text-center">
                  <div className="text-4xl mb-3">🎉</div>
                  <h3 className="text-white font-bold text-lg mb-2">今日旅程完成！</h3>
                  <p className="text-white/80 text-sm">
                    恭喜你完成了今天的所有心理健康练习。坚持就是胜利！
                  </p>
                </div>
              )}
            </div>

            <div className="lg:sticky lg:top-6 h-fit">
              <div className={`bg-gradient-to-b ${selectedActivity.bgColor} backdrop-blur-md rounded-3xl p-6 border ${selectedActivity.borderColor} shadow-2xl`}>
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedActivity.color} flex items-center justify-center shadow-lg`}>
                      <span className="text-3xl">{selectedActivity.icon}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-white text-xl font-bold">{selectedActivity.title}</h2>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedActivity.type === 'CBT' ? 'bg-blue-500/30 text-blue-200' : 'bg-purple-500/30 text-purple-200'}`}>
                          {selectedActivity.type}
                        </span>
                      </div>
                      <p className="text-white/70 text-sm">{selectedActivity.subtitle}</p>
                    </div>
                  </div>
                  <div className="text-right text-white/70 text-sm">
                    <div>建议时长</div>
                    <div className="text-white font-semibold">{selectedActivity.duration}</div>
                  </div>
                </div>

                <div className="rounded-2xl bg-white/10 border border-white/10 p-4 mb-5">
                  <div className="text-white/60 text-xs uppercase tracking-[0.25em] mb-2">练习重点</div>
                  <p className="text-white/90 leading-relaxed">{selectedActivity.focusTitle}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 mb-5">
                  <div className="bg-white/8 rounded-2xl p-4 border border-white/10">
                    <h3 className="text-white font-semibold mb-3">{selectedActivity.previewTitle}</h3>
                    <div className="space-y-3">
                      {selectedActivity.previewSteps.map((step, index) => (
                        <div key={step} className="flex items-start space-x-3">
                          <div className="w-6 h-6 rounded-full bg-white/15 text-white text-xs flex items-center justify-center mt-0.5">
                            {index + 1}
                          </div>
                          <p className="text-white/80 text-sm leading-relaxed flex-1">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/8 rounded-2xl p-4 border border-white/10">
                    <h3 className="text-white font-semibold mb-3">完成后你会获得</h3>
                    <div className="space-y-3">
                      {selectedActivity.outcomes.map((outcome) => (
                        <div key={outcome} className="flex items-start space-x-3">
                          <span className="text-green-300 mt-0.5">✓</span>
                          <p className="text-white/80 text-sm leading-relaxed flex-1">{outcome}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-black/15 border border-white/10 p-4 mb-5">
                  <div className="text-white/60 text-xs uppercase tracking-[0.25em] mb-2">适用场景</div>
                  <p className="text-white/85 text-sm leading-relaxed">{selectedActivity.hint}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleStartActivity(selectedActivity.id)}
                    className={`flex-1 py-3 px-5 rounded-2xl font-semibold text-white bg-gradient-to-r ${selectedActivity.color} hover:shadow-lg transition-all duration-300`}
                  >
                    {completedToday.has(selectedActivity.id) ? '再次练习' : '开始这个练习'}
                  </button>
                  <button
                    onClick={() => handleActivitySelect(dailyActivities[(dailyActivities.findIndex((activity) => activity.id === selectedActivity.id) + 1) % dailyActivities.length].id)}
                    className="flex-1 py-3 px-5 rounded-2xl font-semibold text-white bg-white/10 border border-white/15 hover:bg-white/15 transition-all duration-300"
                  >
                    查看下一个
                  </button>
                </div>

                <div className="mt-4 text-center text-white/55 text-sm">
                  点击左侧不同卡片，这里会切换显示对应的练习内容。
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-white/60 text-sm">
              💡 建议每天选择 1-2 个练习，循序渐进地提升心理健康水平
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DailyJourneyPage
