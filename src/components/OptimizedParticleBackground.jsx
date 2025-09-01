import { useMemo } from 'react'

const OptimizedParticleBackground = ({
  particleCount = 12, // 减少粒子数量
  particleColor = 'bg-yellow-300',
  opacity = 'opacity-60'
}) => {
  // 使用 useMemo 缓存粒子配置，避免重复计算
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 2,
      size: Math.random() * 2 + 1,
      // 添加透明度变化
      opacityVariation: 0.3 + Math.random() * 0.4
    }))
  }, [particleCount])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none particle-container">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute ${particleColor} rounded-full optimized-particle ${opacity}`}
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacityVariation,
            // 使用 CSS transform 而不是复杂的动画
            animation: `float ${particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`
          }}
        />
      ))}
      
      {/* 简化的CSS动画 */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) translateX(0px); 
          }
          50% { 
            transform: translateY(-10px) translateX(5px); 
          }
        }
        
        .optimized-particle {
          will-change: transform;
          backface-visibility: hidden;
          perspective: 1000px;
        }
      `}</style>
    </div>
  )
}

export default OptimizedParticleBackground

