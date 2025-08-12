import { useState, useEffect } from 'react'
import { ChevronRight, X } from 'lucide-react'

// 导入插图
import onboarding1 from '../assets/onboarding-1.png'
import onboarding2 from '../assets/onboarding-2.png'
import onboarding3 from '../assets/onboarding-3.png'

const OnboardingPage = ({ onComplete }) => {
  const [currentPage, setCurrentPage] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const pages = [
    {
      title: '欢迎来到心理健康助手',
      description: '一个安全、温暖的空间，帮助你记录情绪，关注内心健康，开始你的心理健康之旅',
      image: onboarding1,
      bgGradient: 'gradient-nature'
    },
    {
      title: '记录你的情绪',
      description: '通过简单的日志记录，更好地了解自己的情绪变化，培养情绪觉察能力',
      image: onboarding2,
      bgGradient: 'gradient-warm'
    },
    {
      title: '正念练习指导',
      description: '专业的冥想和呼吸练习，帮助你找到内心的平静，建立健康的心理习惯',
      image: onboarding3,
      bgGradient: 'gradient-calm'
    }
  ]

  const nextPage = () => {
    if (isAnimating) return
    
    setIsAnimating(true)
    
    if (currentPage < pages.length - 1) {
      setTimeout(() => {
        setCurrentPage(currentPage + 1)
        setIsAnimating(false)
      }, 300)
    } else {
      setTimeout(() => {
        onComplete()
      }, 300)
    }
  }

  const skipOnboarding = () => {
    onComplete()
  }

  // 自动播放效果（可选）
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage < pages.length - 1) {
        // 可以在这里添加自动切换逻辑
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [currentPage])

  return (
    <div className={`min-h-screen ${pages[currentPage].bgGradient} flex flex-col relative overflow-hidden`}>
      {/* 跳过按钮 */}
      <div className="flex justify-end p-6 z-10">
        <button
          onClick={skipOnboarding}
          className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200 px-4 py-2 rounded-full hover:bg-white/20"
        >
          <span className="text-sm font-medium">跳过</span>
          <X size={16} />
        </button>
      </div>

      {/* 主要内容 */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 text-center relative">
        {/* 背景插图 */}
        <div className="relative mb-8">
          <div 
            className={`w-80 h-80 transition-all duration-500 ${
              isAnimating ? 'scale-95 opacity-70' : 'scale-100 opacity-100'
            }`}
            style={{
              transform: `translateY(${Math.sin(Date.now() / 2000) * 5}px)` // 轻微的浮动效果
            }}
          >
            <img
              src={pages[currentPage].image}
              alt={`引导页 ${currentPage + 1}`}
              className="w-full h-full object-contain drop-shadow-lg"
            />
          </div>
          
          {/* 装饰性元素 */}
          <div className="absolute -top-4 -right-4 w-8 h-8 bg-accent/20 rounded-full animate-pulse"></div>
          <div className="absolute -bottom-2 -left-6 w-6 h-6 bg-primary/20 rounded-full animate-pulse delay-1000"></div>
        </div>
        
        {/* 文字内容 */}
        <div className={`transition-all duration-500 ${isAnimating ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'}`}>
          <h1 className="text-3xl font-heading text-foreground mb-6 leading-tight">
            {pages[currentPage].title}
          </h1>
          
          <p className="text-muted-foreground text-lg mb-12 max-w-sm leading-relaxed">
            {pages[currentPage].description}
          </p>
        </div>

        {/* 分页指示器 */}
        <div className="flex space-x-3 mb-12">
          {pages.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-500 ${
                index === currentPage 
                  ? 'bg-accent w-8 shadow-lg' 
                  : index < currentPage
                  ? 'bg-accent/60 w-2'
                  : 'bg-muted w-2'
              }`}
            />
          ))}
        </div>

        {/* 下一步按钮 */}
        <button
          onClick={nextPage}
          disabled={isAnimating}
          className={`px-8 py-4 rounded-xl font-medium transition-all duration-300 active:scale-95 bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg hover:shadow-xl flex items-center space-x-3 ${
            currentPage === pages.length - 1 ? 'pulse-glow' : ''
          } ${isAnimating ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          <span className="text-lg">
            {currentPage === pages.length - 1 ? '开始使用' : '下一步'}
          </span>
          <ChevronRight size={24} className={`transition-transform duration-300 ${isAnimating ? 'translate-x-1' : ''}`} />
        </button>
      </div>

      {/* 底部装饰 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/10 to-transparent pointer-events-none"></div>
      
      {/* 页面切换时的覆盖层 */}
      {isAnimating && (
        <div className="absolute inset-0 bg-white/20 backdrop-blur-sm transition-opacity duration-300"></div>
      )}
    </div>
  )
}

export default OnboardingPage

