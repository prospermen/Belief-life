import { useEffect } from 'react'
import GenshinButton from './GenshinButton'

const GenshinModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true,
  className = ''
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4'
  }

  const sizeClasses = sizes[size] || sizes.md

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 模态框内容 */}
      <div className={`relative w-full ${sizeClasses} ${className}`}>
        <div className="genshin-glass rounded-3xl p-6 border border-white/20 genshin-shadow-mystical">
          {/* 标题栏 */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between mb-6">
              {title && (
                <h3 className="text-white font-semibold text-lg genshin-text-glow">
                  {title}
                </h3>
              )}
              {showCloseButton && (
                <GenshinButton
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="w-8 h-8 p-0 rounded-full"
                >
                  ✕
                </GenshinButton>
              )}
            </div>
          )}
          
          {/* 内容区域 */}
          <div className="text-white">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GenshinModal

