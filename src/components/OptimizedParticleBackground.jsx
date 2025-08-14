import { useMemo } from 'react'

const OptimizedParticleBackground = ({ 
  particleCount = 15, 
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
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`
          }}
        />
      ))}
    </div>
  )
}

export default OptimizedParticleBackground

