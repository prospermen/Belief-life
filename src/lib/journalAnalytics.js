const MOOD_SCORE_MAP = {
  happy: 9,
  excited: 8,
  calm: 7,
  sad: 4,
  anxious: 3,
  angry: 2,
}

const ANXIETY_SCORE_MAP = {
  happy: 1,
  excited: 2,
  calm: 1,
  sad: 5,
  anxious: 9,
  angry: 7,
}

const POSITIVE_MOODS = new Set(['happy', 'excited', 'calm'])
const NEGATIVE_MOODS = new Set(['sad', 'anxious', 'angry'])

const DEFAULT_VALUES = ['家庭', '健康', '学习', '工作']

const TRAP_RULES = [
  { trap: '全或无思维', keywords: ['总是', '永远', '必须', '完全', '一点都不'] },
  { trap: '过度概括', keywords: ['每次', '所有', '从来', '一直', '注定'] },
  { trap: '灾难化', keywords: ['完了', '糟糕', '崩溃', '受不了', '来不及'] },
  { trap: '自我否定', keywords: ['失败', '没用', '不够好', '做不到', '不行'] },
]

const padNumber = (value) => String(value).padStart(2, '0')

const parseLocalDate = (dateStr) => {
  if (!dateStr) {
    return new Date()
  }

  const [year, month, day] = dateStr.split('-').map(Number)

  return new Date(year, month - 1, day)
}

const formatShortDate = (date) => `${date.getMonth() + 1}/${date.getDate()}`

const startOfDay = (date) => {
  const nextDate = new Date(date)
  nextDate.setHours(0, 0, 0, 0)
  return nextDate
}

const startOfWeek = (date) => {
  const nextDate = startOfDay(date)
  const day = nextDate.getDay() || 7
  nextDate.setDate(nextDate.getDate() - day + 1)
  return nextDate
}

const average = (values) => {
  if (values.length === 0) {
    return 0
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length
}

const roundOneDecimal = (value) => Math.round(value * 10) / 10

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const getMoodScore = (entry) => {
  const baseScore = MOOD_SCORE_MAP[entry.mood] ?? 5
  const intensityAdjustment = (Number(entry.intensity) - 5) * 0.25
  return clamp(roundOneDecimal(baseScore + intensityAdjustment), 1, 10)
}

const getAnxietyScore = (entry) => {
  const baseScore = ANXIETY_SCORE_MAP[entry.mood] ?? 4
  const intensityAdjustment = (Number(entry.intensity) - 5) * 0.35
  return clamp(roundOneDecimal(baseScore + intensityAdjustment), 1, 10)
}

const getRecentDays = (days = 7) => {
  const today = startOfDay(new Date())

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (days - index - 1))
    return date
  })
}

const getWeekLabel = (index) => `第${index + 1}周`

const getEntriesByDate = (entries) => {
  return entries.reduce((map, entry) => {
    const key = entry.date
    if (!map.has(key)) {
      map.set(key, [])
    }

    map.get(key).push(entry)
    return map
  }, new Map())
}

const getEntriesText = (entry) => `${entry.content ?? ''} ${(entry.tags ?? []).join(' ')}`

export const getMoodTrendData = (entries) => {
  const entriesByDate = getEntriesByDate(entries)

  return getRecentDays(7).map((date) => {
    const key = `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`
    const dayEntries = entriesByDate.get(key) ?? []

    return {
      date: formatShortDate(date),
      fullDate: key,
      mood: dayEntries.length > 0 ? roundOneDecimal(average(dayEntries.map(getMoodScore))) : 0,
      anxiety: dayEntries.length > 0 ? roundOneDecimal(average(dayEntries.map(getAnxietyScore))) : 0,
      count: dayEntries.length,
    }
  })
}

export const getMoodSummary = (entries) => {
  const trendData = getMoodTrendData(entries)
  const recordedDays = trendData.filter((item) => item.count > 0)

  return {
    averageMood: recordedDays.length > 0 ? roundOneDecimal(average(recordedDays.map((item) => item.mood))) : 0,
    averageAnxiety: recordedDays.length > 0 ? roundOneDecimal(average(recordedDays.map((item) => item.anxiety))) : 0,
    recordedDays: recordedDays.length,
  }
}

export const getCbtAnalytics = (entries) => {
  const thisWeek = startOfWeek(new Date())
  const weeks = Array.from({ length: 4 }, (_, index) => {
    const weekStart = new Date(thisWeek)
    weekStart.setDate(thisWeek.getDate() - (3 - index) * 7)

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)

    const weekEntries = entries.filter((entry) => {
      const entryDate = startOfDay(parseLocalDate(entry.date))
      return entryDate >= weekStart && entryDate <= weekEnd
    })

    const negativeEntries = weekEntries.filter((entry) => NEGATIVE_MOODS.has(entry.mood))
    const strength = weekEntries.length > 0
      ? Math.round(average(weekEntries.map((entry) => NEGATIVE_MOODS.has(entry.mood) ? getAnxietyScore(entry) * 10 : getAnxietyScore(entry) * 6)))
      : 0

    return {
      week: getWeekLabel(index),
      strength,
      negativeCount: negativeEntries.length,
    }
  })

  const trapCounts = TRAP_RULES.map((rule) => ({
    trap: rule.trap,
    count: entries.reduce((count, entry) => {
      const text = getEntriesText(entry)
      const keywordHits = rule.keywords.filter((keyword) => text.includes(keyword)).length
      const negativeBonus = NEGATIVE_MOODS.has(entry.mood) && keywordHits > 0 ? 1 : 0
      return count + keywordHits + negativeBonus
    }, 0),
  }))

  const populatedTrapCounts = trapCounts.some((item) => item.count > 0)
    ? trapCounts
    : [
        { trap: '压力反应', count: entries.filter((entry) => entry.mood === 'anxious').length },
        { trap: '自我批评', count: entries.filter((entry) => entry.mood === 'sad').length },
        { trap: '情绪化推理', count: entries.filter((entry) => entry.mood === 'angry').length },
        { trap: '回避倾向', count: entries.filter((entry) => entry.intensity >= 8).length },
      ]

  const strongestWeek = weeks.reduce((maxWeek, currentWeek) => {
    return currentWeek.strength > maxWeek.strength ? currentWeek : maxWeek
  }, weeks[0] ?? { strength: 0 })

  return {
    thoughtPattern: strongestWeek.strength >= 70 ? '最近几周压力想法更容易反复出现' : '最近的想法整体趋于稳定',
    beliefStrength: weeks,
    cognitiveTraps: populatedTrapCounts,
  }
}

export const getActAnalytics = (entries) => {
  const tagCounts = entries.reduce((map, entry) => {
    entry.tags.forEach((tag) => {
      map.set(tag, (map.get(tag) ?? 0) + 1)
    })
    return map
  }, new Map())

  const recentThreshold = startOfDay(new Date())
  recentThreshold.setDate(recentThreshold.getDate() - 13)

  const recentTagCounts = entries.reduce((map, entry) => {
    const entryDate = startOfDay(parseLocalDate(entry.date))

    if (entryDate < recentThreshold) {
      return map
    }

    entry.tags.forEach((tag) => {
      map.set(tag, (map.get(tag) ?? 0) + 1)
    })

    return map
  }, new Map())

  const sortedTags = [...tagCounts.entries()].sort((firstTag, secondTag) => secondTag[1] - firstTag[1])
  const sourceTags = sortedTags.slice(0, 4).map(([tag]) => tag)
  const values = (sourceTags.length > 0 ? sourceTags : DEFAULT_VALUES).map((tag) => {
    const totalCount = tagCounts.get(tag) ?? 1
    const recentCount = recentTagCounts.get(tag) ?? 0

    return {
      value: tag,
      importance: clamp(5 + totalCount, 1, 10),
      action: clamp(3 + recentCount * 2, 1, 10),
    }
  })

  const thisWeek = startOfWeek(new Date())
  const psychologicalFlexibility = Array.from({ length: 4 }, (_, index) => {
    const weekStart = new Date(thisWeek)
    weekStart.setDate(thisWeek.getDate() - (3 - index) * 7)

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)

    const weekEntries = entries.filter((entry) => {
      const entryDate = startOfDay(parseLocalDate(entry.date))
      return entryDate >= weekStart && entryDate <= weekEnd
    })

    const positiveCount = weekEntries.filter((entry) => POSITIVE_MOODS.has(entry.mood)).length
    const negativeCount = weekEntries.filter((entry) => NEGATIVE_MOODS.has(entry.mood)).length
    const score = weekEntries.length === 0
      ? 0
      : clamp(Math.round(50 + ((positiveCount - negativeCount) / weekEntries.length) * 35), 1, 100)

    return {
      week: getWeekLabel(index),
      score,
    }
  })

  return {
    values,
    psychologicalFlexibility,
  }
}

export const getSmartInsights = (entries) => {
  if (entries.length === 0) {
    return []
  }

  const anxietyByWeekday = Array.from({ length: 7 }, () => [])
  entries.forEach((entry) => {
    const date = parseLocalDate(entry.date)
    const weekday = date.getDay()
    anxietyByWeekday[weekday].push(getAnxietyScore(entry))
  })

  const weekdayLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekdayAnxietyData = anxietyByWeekday.map((scores, index) => ({
    day: weekdayLabels[index],
    anxiety: scores.length > 0 ? roundOneDecimal(average(scores)) : 0,
  }))
  const highestWeekday = weekdayAnxietyData.reduce((maxDay, currentDay) => {
    return currentDay.anxiety > maxDay.anxiety ? currentDay : maxDay
  }, weekdayAnxietyData[0])

  const cbtAnalytics = getCbtAnalytics(entries)
  const actAnalytics = getActAnalytics(entries)
  const summary = getMoodSummary(entries)

  const alignedValue = actAnalytics.values.reduce((bestValue, currentValue) => {
    const currentGap = currentValue.importance - currentValue.action
    const bestGap = bestValue.importance - bestValue.action
    return currentGap > bestGap ? currentValue : bestValue
  }, actAnalytics.values[0])

  const highIntensityCount = entries.filter((entry) => entry.intensity >= 8).length
  const severity = highIntensityCount >= 3 || summary.averageAnxiety >= 6 ? 'high' : summary.averageAnxiety >= 4 ? 'medium' : 'low'

  return [
    {
      id: 'pattern',
      type: 'pattern',
      title: '情绪模式发现',
      description: `${highestWeekday.day}的压力分值相对更高，可能是你更容易感到紧绷的时间段。`,
      icon: '📊',
      severity,
      suggestions: [
        `在${highestWeekday.day}前一天提前安排要事，减少临时压力`,
        '为高压时段预留 10 分钟呼吸或散步缓冲',
        '记录触发事件，观察是否和工作、社交或休息不足有关',
      ],
      data: weekdayAnxietyData,
    },
    {
      id: 'cbt',
      type: 'cbt_act_fusion',
      title: 'CBT与ACT融合建议',
      description: cbtAnalytics.thoughtPattern,
      icon: '🧠',
      severity: cbtAnalytics.beliefStrength.some((item) => item.strength >= 70) ? 'high' : 'medium',
      suggestions: [
        '当重复想法出现时，先给它命名，再决定是否需要行动',
        '把最常见的担忧写下来，分别验证证据和替代解释',
        '配合一次呼吸练习或思维游戏，降低想法粘性',
      ],
      triggerThought: cbtAnalytics.thoughtPattern,
      data: cbtAnalytics.beliefStrength.map((item) => ({ day: item.week, anxiety: Math.round(item.strength / 10) })),
    },
    {
      id: 'values',
      type: 'value_alignment',
      title: '价值观对齐分析',
      description: `你最近最在意的“${alignedValue.value}”仍有行动空间，可以尝试把关注转成更具体的安排。`,
      icon: '🧭',
      severity: alignedValue.importance - alignedValue.action >= 3 ? 'medium' : 'low',
      suggestions: [
        `本周为“${alignedValue.value}”安排一个 15 分钟的小行动`,
        '把重要但常拖延的事情拆成最小下一步',
        '完成后再记录一次情绪，观察行动是否带来变化',
      ],
      valueData: actAnalytics.values,
    },
  ]
}
