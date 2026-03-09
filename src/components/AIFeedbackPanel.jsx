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
  const notice = typeof feedback?.notice === 'string' ? feedback.notice.trim() : ''

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

      {!error && notice && (
        <div className="rounded-lg border border-amber-300/35 bg-amber-500/10 px-3 py-2 text-amber-100 text-xs mb-3">
          {notice}
        </div>
      )}

      {!loading && !error && !hasContent && (
        <div className="text-white/55 text-sm leading-relaxed">
          Continue writing. AI feedback will update with observations and a next step.
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
            <p className="text-white/85 text-sm leading-relaxed">✅ Next step: {feedback.nextAction}</p>
          )}
          {feedback.followUpQuestion && (
            <p className={`${tone.question} text-sm leading-relaxed`}>❓ {feedback.followUpQuestion}</p>
          )}
          {feedback.riskFlag === 'high' && (
            <div className="rounded-lg border border-red-400/35 bg-red-500/10 px-3 py-2 text-red-100 text-xs">
              High-risk signal detected: use SOS first and seek offline support immediately.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AIFeedbackPanel
