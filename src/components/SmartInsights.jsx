import { useEffect, useMemo, useState } from 'react'
import OptimizedParticleBackground from './OptimizedParticleBackground'
import { getSmartInsights } from '../lib/journalAnalytics'
import {
  getJournalEntries,
  JOURNAL_STORAGE_UPDATED_EVENT,
} from '../lib/journalStorage'
import {
  getPracticeSessions,
  PRACTICE_STORAGE_UPDATED_EVENT,
} from '../lib/practiceStorage'

const SmartInsights = ({ onBack }) => {
  const [entries, setEntries] = useState([])
  const [practiceSessions, setPracticeSessions] = useState([])
  const [selectedInsight, setSelectedInsight] = useState(null)

  useEffect(() => {
    const syncEntries = () => {
      setEntries(getJournalEntries())
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

  const insights = useMemo(() => {
    const journalInsights = getSmartInsights(entries)

    if (practiceSessions.length === 0) {
      return journalInsights
    }

    const recentSessions = practiceSessions.slice(0, 5)
    const gameCounts = recentSessions.reduce((map, session) => {
      map.set(session.title, (map.get(session.title) ?? 0) + 1)
      return map
    }, new Map())

    const favoritePractice = [...gameCounts.entries()].sort((firstItem, secondItem) => secondItem[1] - firstItem[1])[0]
    const latestSession = recentSessions[0]

    return [
      {
        id: 'practice',
        type: 'practice_tracking',
        title: '练习投入反馈',
        description: favoritePractice
          ? `你最近最常使用的是“${favoritePractice[0]}”，说明你正在主动练习与想法保持距离。`
          : '你最近开始主动使用思维游戏练习，这对情绪调节很有帮助。',
        icon: '🎮',
        severity: recentSessions.length >= 3 ? 'low' : 'medium',
        suggestions: [
          latestSession?.insight ?? '保持练习节奏，让心理上的“松动感”逐步累积。',
          '尝试轮换不同类型的思维游戏，体验不同的解离方式。',
          '在练习后顺手记录一次情绪，能让洞察更准确地看见变化。',
        ],
      },
      ...journalInsights,
    ]
  }, [entries, practiceSessions])

  useEffect(() => {
    if (selectedInsight && !insights.find((insight) => insight.id === selectedInsight.id)) {
      setSelectedInsight(null)
    }
  }, [insights, selectedInsight])

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'from-red-400 to-pink-500'
      case 'medium':
        return 'from-yellow-400 to-orange-500'
      case 'low':
        return 'from-green-400 to-emerald-500'
      default:
        return 'from-blue-400 to-cyan-500'
    }
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high':
        return '🚨'
      case 'medium':
        return '⚠️'
      case 'low':
        return '💡'
      default:
        return 'ℹ️'
    }
  }

  const renderInsightTrend = (data) => {
    const maxValue = Math.max(...data.map((item) => item.anxiety), 1)

    return (
      <div className="h-48 bg-white/10 rounded-lg p-4">
        <div className="flex items-end justify-between h-full space-x-2">
          {data.map((item) => (
            <div key={item.day} className="flex-1 flex flex-col items-center justify-end space-y-2">
              <div
                className="w-6 bg-gradient-to-t from-purple-400 to-pink-500 rounded-t"
                style={{ height: `${Math.max((item.anxiety / maxValue) * 120, item.anxiety > 0 ? 12 : 4)}px`, opacity: item.anxiety > 0 ? 1 : 0.25 }}
              />
              <span className="text-white/60 text-xs">{item.day}</span>
              <span className="text-white/80 text-xs">{item.anxiety}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderValueCards = (valueData) => (
    <div className="grid grid-cols-2 gap-3">
      {valueData.map((item) => (
        <div key={item.value} className="bg-white/10 rounded-lg p-3 border border-white/10">
          <div className="text-white font-medium mb-2">{item.value}</div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-white/70">
              <span>重要性</span>
              <span className="text-blue-400">{item.importance}/10</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full" style={{ width: `${item.importance * 10}%` }} />
            </div>
            <div className="flex items-center justify-between text-white/70">
              <span>行动投入</span>
              <span className="text-green-400">{item.action}/10</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full" style={{ width: `${item.action * 10}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderEmptyState = () => (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center text-3xl">
        🔍
      </div>
      <h3 className="text-white font-semibold text-xl mb-2">还没有生成洞察</h3>
      <p className="text-white/70 leading-relaxed">
        多记录几次情绪、强度和标签后，我就能根据你的真实数据总结模式和建议。
      </p>
    </div>
  )

  if (selectedInsight) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url("/src/assets/history-bg.webp")`,
            filter: 'brightness(0.7)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/40 via-purple-900/30 to-blue-900/50" />

        <OptimizedParticleBackground color="#8B5CF6" quantity={6} />

        <div className="relative z-10 min-h-screen p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setSelectedInsight(null)}
              className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
            >
              <span className="text-xl">←</span>
              <span>返回</span>
            </button>
            <h1 className="text-xl font-bold text-white">洞察详情</h1>
            <div className="w-16" />
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-6">
            <div className="flex items-start space-x-4 mb-4">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getSeverityColor(selectedInsight.severity)} flex items-center justify-center text-2xl shadow-lg`}>
                {selectedInsight.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h2 className="text-xl font-bold text-white">{selectedInsight.title}</h2>
                  <span className="text-lg">{getSeverityIcon(selectedInsight.severity)}</span>
                </div>
                <p className="text-white/80 leading-relaxed">{selectedInsight.description}</p>
              </div>
            </div>

            {selectedInsight.data && (
              <div className="bg-white/5 rounded-xl p-4 mb-4">
                <h3 className="text-white font-semibold mb-3">数据趋势</h3>
                {renderInsightTrend(selectedInsight.data)}
              </div>
            )}

            {selectedInsight.valueData && (
              <div className="bg-white/5 rounded-xl p-4 mb-4">
                <h3 className="text-white font-semibold mb-3">价值观对齐分析</h3>
                {renderValueCards(selectedInsight.valueData)}
              </div>
            )}

            <div>
              <h3 className="text-white font-semibold mb-3 flex items-center">
                <span className="mr-2">💡</span>
                个性化建议
              </h3>
              <div className="space-y-3">
                {selectedInsight.suggestions.map((suggestion, index) => (
                  <div key={suggestion} className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center text-xs font-bold text-white mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-white/90 leading-relaxed flex-1">{suggestion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-lg">
              开始练习
            </button>
            <button
              onClick={() => setSelectedInsight(null)}
              className="flex-1 bg-white/10 backdrop-blur-sm text-white py-3 px-6 rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              返回洞察列表
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url("/src/assets/history-bg.webp")`,
          filter: 'brightness(0.7)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/40 via-purple-900/30 to-blue-900/50" />

      <OptimizedParticleBackground color="#8B5CF6" quantity={6} />

      <div className="relative z-10 min-h-screen p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
          >
            <span className="text-xl">←</span>
            <span>返回</span>
          </button>
          <h1 className="text-xl font-bold text-white">智能洞察</h1>
          <div className="w-16" />
        </div>

        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center shadow-lg">
            <span className="text-3xl">🔍</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">个性化洞察</h2>
          <p className="text-white/80">基于真实日志模式，帮助你更快看见变化和触发点</p>
        </div>

        {insights.length === 0 && renderEmptyState()}

        {insights.length > 0 && (
          <>
            <div className="space-y-4 mb-6">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  onClick={() => setSelectedInsight(insight)}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/20 hover:border-purple-400/50 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getSeverityColor(insight.severity)} flex items-center justify-center text-2xl shadow-lg`}>
                      {insight.icon}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-white font-semibold">{insight.title}</h3>
                        <span className="text-sm">{getSeverityIcon(insight.severity)}</span>
                      </div>
                      <p className="text-white/70 text-sm leading-relaxed mb-3">{insight.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/50">{insight.suggestions.length} 个建议</span>
                        <span className="text-white/40 text-xl">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
                <span className="text-yellow-400">💡</span>
                <span className="text-white/70 text-sm">每新增一条日志，洞察会自动刷新</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default SmartInsights
