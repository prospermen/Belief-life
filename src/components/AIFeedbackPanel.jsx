const AIFeedbackPanel = ({ loading, error, feedback, accent = 'cyan' }) => {
  const accentClassMap = {
    cyan: {
      shell: 'from-cyan-500/15 to-blue-500/10 border-cyan-300/20',
      title: 'text-cyan-200',
      question: 'text-cyan-100',
    },
    violet: {
      shell: 'from-violet-500/15 to-pink-500/10 border-violet-300/20',
      title: 'text-violet-200',
      question: 'text-violet-100',
    },
  }

  const tone = accentClassMap[accent] ?? accentClassMap.cyan
  const hasContent = Boolean(feedback && (feedback.encouragement || feedback.insight || feedback.nextAction || feedback.followUpQuestion))

  return (
    <div className={`bg-gradient-to-r ${tone.shell} rounded-xl border p-4`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`text-xs uppercase tracking-[0.18em] ${tone.title}`}>AI 实时反馈</div>
        {loading && <div className="text-white/55 text-xs">分析中...</div>}
      </div>

      {error && (
        <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-red-200 text-xs mb-3">
          {error}
        </div>
      )}

      {!loading && !error && !hasContent && (
        <div className="text-white/55 text-sm leading-relaxed">
          继续输入或调整内容，AI 会自动给出观察和下一步建议。
        </div>
      )}

      {loading && !hasContent && (
        <div className="space-y-2">
          <div className="h-3 rounded bg-white/10 animate-pulse" />
          <div className="h-3 rounded bg-white/10 animate-pulse w-10/12" />
          <div className="h-3 rounded bg-white/10 animate-pulse w-7/12" />
        </div>
      )}

      {hasContent && (
        <div className="space-y-2.5">
          {feedback.encouragement && (
            <p className="text-white/90 text-sm leading-relaxed">💬 {feedback.encouragement}</p>
          )}
          {feedback.insight && (
            <p className="text-white/80 text-sm leading-relaxed">🔎 {feedback.insight}</p>
          )}
          {feedback.nextAction && (
            <p className="text-white/85 text-sm leading-relaxed">✅ 下一步：{feedback.nextAction}</p>
          )}
          {feedback.followUpQuestion && (
            <p className={`${tone.question} text-sm leading-relaxed`}>❓ {feedback.followUpQuestion}</p>
          )}
          {feedback.riskFlag === 'high' && (
            <div className="rounded-lg border border-red-400/35 bg-red-500/10 px-3 py-2 text-red-100 text-xs">
              检测到高风险信号：建议优先使用 SOS 功能并寻求线下支持。
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AIFeedbackPanel
