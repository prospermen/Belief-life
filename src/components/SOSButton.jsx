import { useState, useEffect } from 'react'
import GenshinModal from './GenshinModal'

const SOSButton = ({ onEmotionHelp, onThoughtHelp }) => {
  const [showModal, setShowModal] = useState(false)
  const [selectedAudio, setSelectedAudio] = useState('/meditation-music.mp3')
  const [audio] = useState(new Audio(selectedAudio))

  useEffect(() => {
    audio.loop = true // 循环播放
    audio.volume = 0.5 // 设置音量

    if (showModal) {
      audio.play().catch(e => console.error("Error playing audio:", e))
    } else {
      audio.pause()
      audio.currentTime = 0 // 停止时重置播放时间
    }

    return () => {
      audio.pause()
      audio.currentTime = 0
    }
  }, [showModal, audio, selectedAudio])

  const handleSOSClick = () => {
    setShowModal(true)
  }

  const handleOptionSelect = (type) => {
    setShowModal(false)
    if (type === 'emotion') {
      onEmotionHelp()
    } else if (type === 'thought') {
      onThoughtHelp()
    }
  }

  return (
    <>
      {/* SOS浮动按钮 */}
      <button
        onClick={handleSOSClick}
        className="fixed bottom-20 right-6 z-50 w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center group"
        style={{
          boxShadow: '0 0 30px rgba(239, 68, 68, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.2)',
          animation: 'pulse 2s infinite'
        }}
      >
        <div className="relative">
          <span className="text-xl font-bold">SOS</span>
          <div className="absolute -inset-2 bg-red-400 rounded-full opacity-30 animate-ping group-hover:animate-none"></div>
        </div>
      </button>

      {/* 选择模态框 */}
      <GenshinModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="需要帮助？"
        className="max-w-md"
      >
        <div className="p-6 space-y-4">
          <p className="text-white/80 text-center mb-6">
            选择你想要处理的类型：
          </p>
          
          <div className="space-y-3">
            {/* 处理感受选项 */}
            <button
              onClick={() => handleOptionSelect('emotion')}
              className="w-full p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-lg hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300 group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💙</span>
                </div>
                <div className="text-left">
                  <h3 className="text-white font-semibold text-lg">处理感受</h3>
                  <p className="text-white/70 text-sm">通过呼吸练习和正念技巧平静情绪</p>
                </div>
              </div>
            </button>

            {/* 处理想法选项 */}
            <button
              onClick={() => handleOptionSelect('thought')}
              className="w-full p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-lg hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300 group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🧠</span>
                </div>
                <div className="text-left">
                  <h3 className="text-white font-semibold text-lg">处理想法</h3>
                  <p className="text-white/70 text-sm">通过思维降温技巧重构负面想法</p>
                </div>
              </div>
            </button>
          </div>

          {/* 音频选择 */}
          <div className="mt-6">
            <label htmlFor="audio-select" className="block text-white/80 text-center mb-2">选择背景音乐：</label>
            <select
              id="audio-select"
              value={selectedAudio}
              onChange={(e) => setSelectedAudio(e.target.value)}
              className="w-full p-2 rounded-md bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="/meditation-music.mp3">冥想音乐</option>
              <option value="/nature-ambience.mp3">自然环境音</option>
              <option value="/5-minute-breathing-meditation.mp3">5分钟呼吸冥想</option>
              <option value="/11-minute-awareness-of-breath-practice.mp3">11分钟呼吸意识练习</option>
            </select>
          </div>
        </div>
      </GenshinModal>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 30px rgba(239, 68, 68, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.2);
          }
          50% {
            box-shadow: 0 0 50px rgba(239, 68, 68, 0.8), inset 0 0 20px rgba(255, 255, 255, 0.3);
          }
        }
      `}</style>
    </>
  )
}

export default SOSButton


