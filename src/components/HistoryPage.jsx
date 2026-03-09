import { useState } from 'react'
import OptimizedParticleBackground from './OptimizedParticleBackground'

const HistoryPage = () => {
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState(null)

  // 模拟日志数据
  const mockEntries = [
    {
      id: 1,
      date: '2024-08-12',
      time: '14:30',
      mood: 'happy',
      intensity: 8,
      content: '今天天气很好，和朋友一起去公园散步，心情特别愉快。看到盛开的花朵，感受到生活的美好。',
      tags: ['户外活动', '朋友', '自然']
    },
    {
      id: 2,
      date: '2024-08-11',
      time: '21:15',
      mood: 'calm',
      intensity: 7,
      content: '晚上做了冥想练习，感觉内心很平静。今天的工作虽然忙碌，但通过正念练习找到了内心的宁静。',
      tags: ['冥想', '工作', '正念']
    },
    {
      id: 3,
      date: '2024-08-10',
      time: '16:45',
      mood: 'anxious',
      intensity: 6,
      content: '明天有重要的会议，感到有些紧张和焦虑。尝试了深呼吸练习，情况有所好转。',
      tags: ['工作压力', '会议', '焦虑']
    },
    {
      id: 4,
      date: '2024-08-09',
      time: '10:20',
      mood: 'excited',
      intensity: 9,
      content: '收到了期待已久的好消息！心情非常激动，想要和所有人分享这份喜悦。',
      tags: ['好消息', '激动', '分享']
    },
    {
      id: 5,
      date: '2024-08-08',
      time: '19:30',
      mood: 'sad',
      intensity: 4,
      content: '今天有些低落，可能是因为天气阴沉的缘故。看了一部温暖的电影，心情稍微好了一些。',
      tags: ['低落', '天气', '电影']
    },
    {
      id: 6,
      date: '2024-08-07',
      time: '12:00',
      mood: 'angry',
      intensity: 5,
      content: '上午遇到了一些不愉快的事情，感到很生气。通过写日记的方式发泄了情绪，现在感觉好多了。',
      tags: ['生气', '发泄', '写作']
    }
  ]
  const journalEntries = mockEntries

  // 情绪配置
  const moodConfig = {
    happy: { name: '开心', emoji: '😊', color: 'from-green-400 to-emerald-500', borderColor: 'border-green-400' },
    sad: { name: '难过', emoji: '😢', color: 'from-blue-400 to-cyan-500', borderColor: 'border-blue-400' },
    angry: { name: '愤怒', emoji: '😠', color: 'from-red-400 to-rose-500', borderColor: 'border-red-400' },
    anxious: { name: '焦虑', emoji: '😰', color: 'from-purple-400 to-violet-500', borderColor: 'border-purple-400' },
    calm: { name: '平静', emoji: '😌', color: 'from-cyan-400 to-blue-500', borderColor: 'border-cyan-400' },
    excited: { name: '兴奋', emoji: '🤩', color: 'from-yellow-400 to-orange-500', borderColor: 'border-yellow-400' }
  }

  const filterOptions = [
    { id: 'all', name: '全部记录', icon: '📖' },
    { id: 'happy', name: '开心', icon: '😊' },
    { id: 'sad', name: '难过', icon: '😢' },
    { id: 'angry', name: '愤怒', icon: '😠' },
    { id: 'anxious', name: '焦虑', icon: '😰' },
    { id: 'calm', name: '平静', icon: '😌' },
    { id: 'excited', name: '兴奋', icon: '🤩' }
  ]

  // 筛选日志
  const filteredEntries = selectedFilter === 'all' 
    ? journalEntries 
    : journalEntries.filter(entry => entry.mood === selectedFilter)

  // 格式化日期
  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (date.toDateString() === today.toDateString()) {
      return '今天'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '昨天'
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })
    }
  }

  // 计算统计信息
  const stats = {
    total: journalEntries.length,
    positive: journalEntries.filter(entry => ['happy', 'excited', 'calm'].includes(entry.mood)).length,
    avgIntensity: journalEntries.length > 0 ? 
      Math.round(journalEntries.reduce((sum, entry) => sum + entry.intensity, 0) / journalEntries.length) : 0
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 背景 */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url("/src/assets/history-bg.webp")`,
          filter: 'brightness(0.7)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-purple-900/60 to-slate-900/80" />
      
<OptimizedParticleBackground color="#8B5CF6" quantity={12} />

      <div className="relative z-10 min-h-screen">
        {/* 顶部标题和筛选 */}
        <div className="flex items-center justify-between p-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              📚 情绪档案
            </h1>
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

        {/* 本周统计 */}
        <div className="px-6 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <h3 className="text-white font-semibold mb-3 flex items-center">
              <span className="mr-2">📊</span>
              本周统计
            </h3>
            <div className="grid grid-cols-3 gap-4">
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
            </div>
          </div>
        </div>

        {/* 日志列表 */}
        <div className="px-6 pb-24">
          {filteredEntries.length === 0 ? (
            // 空状态
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-3xl">📝</span>
              </div>
              <h3 className="text-white font-semibold mb-2">暂无记录</h3>
              <p className="text-white/70 text-sm">
                {selectedFilter === 'all' ? '开始记录您的第一篇情绪日志吧' : '没有找到相关的情绪记录'}
              </p>
            </div>
          ) : (
            // 时间线布局
            <div className="relative">
              {/* 时间线 */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-yellow-400 via-blue-400 to-purple-400 opacity-30" />
              
              <div className="space-y-6">
                {filteredEntries.map((entry) => {
                  const moodInfo = moodConfig[entry.mood]
                  return (
                    <div key={entry.id} className="relative flex items-start space-x-4">
                      {/* 时间线节点 */}
                      <div className={`relative z-10 w-4 h-4 rounded-full bg-gradient-to-r ${moodInfo.color} border-2 border-white shadow-lg`} />
                      
                      {/* 日志卡片 */}
                      <div 
                        className={`flex-1 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border-l-4 ${moodInfo.borderColor} hover:bg-white/20 transition-all duration-300 cursor-pointer group`}
                        onClick={() => setSelectedEntry(entry)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{moodInfo.emoji}</span>
                            <span className="text-white font-medium">{moodInfo.name}</span>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-2 h-2 rounded-full ${
                                    i < Math.round(entry.intensity / 2) ? 'bg-yellow-400' : 'bg-white/20'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="text-white/60 text-sm">
                            {formatDate(entry.date)} {entry.time}
                          </div>
                        </div>
                        
                        <p className="text-white/80 text-sm mb-3 line-clamp-2">
                          {entry.content}
                        </p>
                        
                        <div className="flex flex-wrap gap-2">
                          {entry.tags.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
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

      {/* 筛选模态框 */}
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

      {/* 日志详情模态框 */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-lg">日志详情</h3>
              <button
                onClick={() => setSelectedEntry(null)}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{moodConfig[selectedEntry.mood].emoji}</span>
                <div>
                  <div className="text-white font-medium">{moodConfig[selectedEntry.mood].name}</div>
                  <div className="text-white/60 text-sm">
                    {formatDate(selectedEntry.date)} {selectedEntry.time}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-white/70 text-sm">强度:</span>
                <div className="flex items-center space-x-1">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < selectedEntry.intensity ? 'bg-yellow-400' : 'bg-white/20'
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
                {selectedEntry.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white/10 rounded-full text-white/70 text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button className="flex-1 py-3 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-colors">
                  编辑
                </button>
                <button className="flex-1 py-3 bg-red-500/20 rounded-xl text-red-300 hover:bg-red-500/30 transition-colors">
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HistoryPage

