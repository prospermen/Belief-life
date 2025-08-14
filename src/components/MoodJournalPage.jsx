import React, { useState } from 'react'
import OptimizedParticleBackground from './OptimizedParticleBackground'
import GenshinCard from './GenshinCard'
import GenshinButton from './GenshinButton'
import GenshinModal from './GenshinModal'

const MoodJournalPage = () => {
  const [selectedMood, setSelectedMood] = useState("")
  const [moodIntensity, setMoodIntensity] = useState(5)
  const [journalText, setJournalText] = useState("")
  const [selectedTags, setSelectedTags] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const moods = [
    { id: 'happy', label: '开心', emoji: '😊', color: 'border-green-400', hoverColor: 'hover:bg-green-400/20' },
    { id: 'sad', label: '难过', emoji: '😢', color: 'border-blue-400', hoverColor: 'hover:bg-blue-400/20' },
    { id: 'angry', label: '愤怒', emoji: '😠', color: 'border-red-400', hoverColor: 'hover:bg-red-400/20' },
    { id: 'anxious', label: '焦虑', emoji: '😰', color: 'border-purple-400', hoverColor: 'hover:bg-purple-400/20' },
    { id: 'calm', label: '平静', emoji: '😌', color: 'border-cyan-400', hoverColor: 'hover:bg-cyan-400/20' },
    { id: 'excited', label: '兴奋', emoji: '🤩', color: 'border-yellow-400', hoverColor: 'hover:bg-yellow-400/20' }
  ]

  const tags = [
    { name: '工作', color: 'border-blue-500' },
    { name: '学习', color: 'border-green-500' },
    { name: '家庭', color: 'border-red-500' },
    { name: '朋友', color: 'border-yellow-500' },
    { name: '健康', color: 'border-purple-500' },
    { name: '运动', color: 'border-indigo-500' },
    { name: '娱乐', color: 'border-pink-500' },
    { name: '旅行', color: 'border-teal-500' },
    { name: '爱情', color: 'border-rose-500' },
    { name: '金钱', color: 'border-amber-500' },
    { name: '天气', color: 'border-cyan-500' },
    { name: '其他', color: 'border-gray-500' }
  ]

  const handleTagToggle = (tagName) => {
    setSelectedTags(prev => 
      prev.includes(tagName) 
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    )
  }

  const resetForm = () => {
    setSelectedMood("")
    setMoodIntensity(5)
    setJournalText("")
    setSelectedTags([])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedMood || !journalText.trim()) {
      alert('请选择情绪并填写日志内容')
      return
    }

    setIsLoading(true)
    
    // 模拟保存
    setTimeout(() => {
      setIsLoading(false)
      setShowSuccessModal(true)
      resetForm()
    }, 1500)
  }

  return (
    <div className="min-h-screen relative overflow-hidden pb-24">
      {/* 背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
      
      {/* 背景装饰 */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-yellow-400/5 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-32 right-32 w-48 h-48 bg-blue-400/5 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}} />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-purple-400/5 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}} />
      </div>

<OptimizedParticleBackground color="#FFFFFF" quantity={10} />

      {/* 主要内容 */}
      <div className="relative z-10 p-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="genshin-title text-3xl text-center mb-8 genshin-text-glow">情绪日志</h1>
          
          <GenshinCard className="p-6 mb-6" hover={false}>
            <h2 className="genshin-subtitle text-lg mb-4">今天的心情如何？</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
              {moods.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 ${mood.color} transition-all duration-300
                    ${selectedMood === mood.id ? `bg-white/20 ${mood.color} genshin-shadow-glow` : `bg-white/5 ${mood.hoverColor}`}
                  `}
                >
                  <span className="text-4xl mb-2">{mood.emoji}</span>
                  <span className="text-white font-medium">{mood.label}</span>
                </button>
              ))}
            </div>
            
            {selectedMood && (
              <div className="mt-6">
                <label className="block genshin-subtitle text-lg mb-2">情绪强度：{moodIntensity} / 10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={moodIntensity}
                  onChange={(e) => setMoodIntensity(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer genshin-slider"
                />
              </div>
            )}
          </GenshinCard>

          <GenshinCard className="p-6 mb-6" hover={false}>
            <h2 className="genshin-subtitle text-lg mb-4">今天发生了什么？</h2>
            <textarea
              className="w-full h-32 p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 transition-colors"
              placeholder="分享你的想法、感受或今天发生的事情..."
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              maxLength="500"
            />
            <p className="text-right text-white/60 text-sm mt-1">{journalText.length} / 500</p>
          </GenshinCard>

          <GenshinCard className="p-6 mb-6" hover={false}>
            <h2 className="genshin-subtitle text-lg mb-4">相关标签</h2>
            <div className="flex flex-wrap gap-3">
              {tags.map((tag) => (
                <button
                  key={tag.name}
                  onClick={() => handleTagToggle(tag.name)}
                  className={`px-4 py-2 rounded-full border ${tag.color} text-white text-sm font-medium transition-all duration-300
                    ${selectedTags.includes(tag.name) ? 'bg-white/20 genshin-shadow-glow' : 'bg-white/5 hover:bg-white/10'}
                  `}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </GenshinCard>

          <div className="flex justify-center space-x-4">
            <GenshinButton variant="secondary" onClick={resetForm} size="lg">
              重置
            </GenshinButton>
            <GenshinButton 
              variant="primary" 
              onClick={handleSubmit} 
              size="lg" 
              disabled={isLoading}
              icon={isLoading ? <div className="genshin-loading mr-2"></div> : null}
            >
              {isLoading ? '保存中...' : '保存日志'}
            </GenshinButton>
          </div>
        </div>
      </div>

      <GenshinModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} title="日志保存成功！">
        <div className="text-center py-4">
          <p className="text-white text-lg mb-4">您的情绪日志已成功保存，感谢您的记录！</p>
          <GenshinButton variant="primary" onClick={() => setShowSuccessModal(false)}>
            好的
          </GenshinButton>
        </div>
      </GenshinModal>
    </div>
  )
}

export default MoodJournalPage


