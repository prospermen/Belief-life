const GenshinCard = ({ 
  children, 
  variant = 'default', 
  className = '',
  onClick = null,
  hover = true,
  glow = false,
  ...props 
}) => {
  const baseClasses = 'rounded-2xl transition-all duration-300'
  
  const variants = {
    default: 'genshin-glass border border-white/20',
    solid: 'bg-white/10 backdrop-blur-sm border border-white/20',
    mystical: 'bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-sm border border-purple-400/30',
    warm: 'bg-gradient-to-br from-orange-900/30 to-yellow-900/30 backdrop-blur-sm border border-yellow-400/30',
    transparent: 'bg-transparent border border-white/10'
  }
  
  const hoverClasses = hover ? 'hover:bg-white/20 hover:border-white/30 hover:transform hover:-translate-y-1' : ''
  const glowClasses = glow ? 'genshin-shadow-glow' : 'genshin-shadow-soft'
  const clickableClasses = onClick ? 'cursor-pointer' : ''
  
  const variantClasses = variants[variant] || variants.default
  
  return (
    <div
      className={`${baseClasses} ${variantClasses} ${hoverClasses} ${glowClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  )
}

export default GenshinCard

