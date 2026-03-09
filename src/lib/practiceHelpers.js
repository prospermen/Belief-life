import { savePracticeSession } from './practiceStorage'

const saveSession = (payload) => savePracticeSession(payload)

const toCleanText = (value) => {
  if (typeof value !== 'string') {
    return ''
  }

  return value.trim()
}

export const buildAIFeedbackMetadata = (aiFeedback) => {
  if (!aiFeedback || typeof aiFeedback !== 'object') {
    return {}
  }

  const encouragement = toCleanText(aiFeedback.encouragement)
  const nextAction = toCleanText(aiFeedback.nextAction)
  const followUpQuestion = toCleanText(aiFeedback.followUpQuestion)
  const riskReason = toCleanText(aiFeedback.riskReason)
  const riskFlag = ['none', 'mild', 'high'].includes(aiFeedback.riskFlag) ? aiFeedback.riskFlag : ''
  const metadata = {}

  if (encouragement) {
    metadata.aiEncouragement = encouragement
  }

  if (nextAction) {
    metadata.aiNextAction = nextAction
  }

  if (followUpQuestion) {
    metadata.aiFollowUpQuestion = followUpQuestion
  }

  if (riskFlag) {
    metadata.aiRiskFlag = riskFlag
  }

  if (riskReason) {
    metadata.aiRiskReason = riskReason
  }

  return metadata
}

export const recordThinkingDetectiveSession = (responses = {}) => {
  const { aiFeedback, ...responseSnapshot } = responses
  const thought = responses.thought?.trim()
  const trap = responses.trap?.trim()
  const aiMetadata = buildAIFeedbackMetadata(aiFeedback)

  return saveSession({
    activityType: 'daily_journey',
    activityId: 'detective',
    title: '思维侦探日志',
    summary: thought
      ? `你分析了“${thought}”这个热点想法，并尝试重新看待它。`
      : '你完成了一次思维侦探分析。',
    insight: trap
      ? `你识别到的思维陷阱是：${trap}。看见模式，本身就是改变的开始。`
      : '把情绪和事实拆开来看，会让想法不再那么压人。',
    metadata: {
      responses: responseSnapshot,
      ...aiMetadata,
    },
  })
}

export const recordValueCompassSession = (payload = {}) => {
  const { aiFeedback, ...payloadSnapshot } = payload
  const values = payloadSnapshot.selectedValuesText?.trim()
  const actionPlan = payloadSnapshot.actionPlan?.trim()
  const aiMetadata = buildAIFeedbackMetadata(aiFeedback)

  return saveSession({
    activityType: 'daily_journey',
    activityId: 'compass',
    title: '价值罗盘',
    summary: values
      ? `你澄清了当下重要的价值方向：${values}。`
      : '你完成了一次价值观探索。',
    insight: actionPlan
      ? `你为今天设定的行动是：${actionPlan}`
      : '价值观越清晰，行动就越容易落地。',
    metadata: {
      ...payloadSnapshot,
      ...aiMetadata,
    },
  })
}

export const recordThoughtCoolingSession = (responses = {}) => {
  const firstAnswer = Object.values(responses).find((value) => typeof value === 'string' && value.trim().length > 0)

  return saveSession({
    activityType: 'sos',
    activityId: 'thought_cooling',
    title: '思维降温',
    summary: firstAnswer
      ? `你完成了一次思维降温练习，并写下了“${firstAnswer.trim().slice(0, 28)}${firstAnswer.trim().length > 28 ? '…' : ''}”。`
      : '你完成了一次思维降温练习。',
    insight: '先让想法降温，再决定怎么回应，通常会比当场硬碰硬更有效。',
    metadata: { responses },
  })
}

export const recordBreathingSession = (nextAction = 'home') => {
  return saveSession({
    activityType: 'sos',
    activityId: 'breathing_exercise',
    title: '呼吸练习',
    summary: '你完成了一次 4-7-8 呼吸练习，让身体先慢下来。',
    insight: nextAction === 'wave'
      ? '你选择继续进入“感受的浪潮”，说明你已经准备好更进一步地接触情绪。'
      : '当呼吸慢下来时，情绪通常也会更容易被安放。',
    metadata: { nextAction },
  })
}

export const recordEmotionWaveSession = () => {
  return saveSession({
    activityType: 'sos',
    activityId: 'emotion_wave',
    title: '感受的浪潮',
    summary: '你完成了一次“感受的浪潮”练习，尝试与情绪同在而不是对抗。',
    insight: '情绪像浪潮一样会升起也会退去，你可以学习站稳，而不是被卷走。',
  })
}

export const recordGuidedExerciseSession = (exercise) => {
  if (!exercise) {
    return null
  }

  return saveSession({
    activityType: 'guided_exercise',
    activityId: String(exercise.id),
    title: exercise.title,
    summary: `你完成了“${exercise.title}”练习。`,
    insight: `${exercise.description} 建议把练习后的感受也记录下来，方便后续洞察识别你的调节方式。`,
    metadata: {
      category: exercise.category,
      difficulty: exercise.difficulty,
      duration: exercise.duration,
    },
  })
}
