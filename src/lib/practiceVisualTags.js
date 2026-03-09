const practiceTypeConfig = {
  thinking_game: { name: '思维游戏', icon: '🎮' },
  daily_journey: { name: '每日旅程', icon: '🧭' },
  sos: { name: 'SOS练习', icon: '🫶' },
  guided_exercise: { name: '引导练习', icon: '🌿' },
  practice: { name: '练习记录', icon: '✨' },
}

const getPracticeInfo = (activityType) => {
  return practiceTypeConfig[activityType] ?? practiceTypeConfig.practice
}

const getSafeNumber = (value) => {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : null
}

const buildPracticeVisualTags = (session) => {
  const tags = []
  const practiceInfo = getPracticeInfo(session.activityType)
  const metadata = session.metadata && typeof session.metadata === 'object' ? session.metadata : {}

  tags.push({
    id: 'type',
    label: practiceInfo.name,
    icon: practiceInfo.icon,
    tone: 'slate',
  })

  if (metadata.gameLevel) {
    tags.push({
      id: 'game-level',
      label: `等级：${metadata.gameLevel}`,
      tone: 'violet',
    })
  }

  const metricValue = getSafeNumber(metadata.metricValue)
  const goalValue = getSafeNumber(metadata.goalValue)

  if (metricValue !== null && goalValue !== null && goalValue > 0) {
    const completed = metricValue >= goalValue

    tags.push({
      id: 'goal',
      label: `目标 ${metricValue}/${goalValue}`,
      tone: 'cyan',
    })
    tags.push({
      id: 'status',
      label: completed ? '已达标' : '未达标',
      tone: completed ? 'green' : 'amber',
    })
  }

  if (metadata.difficulty) {
    tags.push({
      id: 'difficulty',
      label: `难度：${metadata.difficulty}`,
      tone: 'amber',
    })
  }

  if (metadata.duration) {
    tags.push({
      id: 'duration',
      label: `时长：${metadata.duration}`,
      tone: 'blue',
    })
  }

  if (metadata.category) {
    tags.push({
      id: 'category',
      label: `分类：${metadata.category}`,
      tone: 'blue',
    })
  }

  return tags
}

export {
  getPracticeInfo,
  buildPracticeVisualTags,
}
