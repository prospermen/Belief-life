import { useEffect, useState } from 'react'

const ParticleBackground = ({ 
  particleCount = 15, 
  particleColor = 'bg-yellow-300', 
  animationDuration = '3s',
  opacity = 'opacity-60'
}) => {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 2,
      size: Math.random() * 2 + 1
    }))
    setParticles(newParticles)
  }, [particleCount])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute w-1 h-1 ${particleColor} rounded-full ${opacity} animate-pulse`}
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            width: `${particle.size}px`,
            height: `${particle.size}px`
          }}
        />
      ))}
    </div>
  )
}

export default ParticleBackground

