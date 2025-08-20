import { useMemo } from 'react'

const OptimizedParticleBackground = ({
  particleCount = 20,
  particleColor = 'bg-pink-300',
  opacity = 'opacity-70'
}) => {
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 4,
      duration: 4 + Math.random() * 3,
      size: Math.random() * 3 + 2, // 稍微增大粒子大小
      opacityVariation: 0.4 + Math.random() * 0.5, // 调整透明度范围
      // 新增：随机选择粒子形状（圆形或心形）
      shape: Math.random() > 0.5 ? 'rounded-full' : 'heart-shape'
    }))
  }, [particleCount])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none particle-container">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute ${particle.shape} ${particleColor} optimized-particle ${opacity}`}
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacityVariation,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            // 调整动画，使其更“可爱”地浮动
            animationName: `float-particle-${particle.id}`,
            animationIterationCount: 'infinite',
            animationTimingFunction: 'ease-in-out'
          }}
        />
      ))}
      {/* 定义浮动动画的关键帧 */}
      <style>
        {particles.map(particle => `
          @keyframes float-particle-${particle.id} {
            0%, 100% { transform: translateY(0) translateX(0); }
            25% { transform: translateY(${Math.random() * 20 - 10}px) translateX(${Math.random() * 20 - 10}px); }
            50% { transform: translateY(${Math.random() * 20 - 10}px) translateX(${Math.random() * 20 - 10}px); }
            75% { transform: translateY(${Math.random() * 20 - 10}px) translateX(${Math.random() * 20 - 10}px); }
          }
        `).join('')}
        {/* 定义心形样式 */}
        {`
          .heart-shape {
            position: relative;
            width: 100%;
            height: 100%;
            background-color: currentColor;
            transform: rotate(-45deg);
          }
          .heart-shape:before,
          .heart-shape:after {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            background-color: currentColor;
            border-radius: 50%;
          }
          .heart-shape:before {
            top: -50%;
            left: 0;
          }
          .heart-shape:after {
            top: 0;
            left: 50%;
          }
        `}
      </style>
    </div>
  )
}

export default OptimizedParticleBackground


