import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  DEFAULT_NAV_HEIGHT,
  NAV_HEIGHT_CSS_VAR,
  SAFE_AREA_BOTTOM,
} from '../lib/layoutConstants'

const Navigation = ({ onLogout }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const navRef = useRef(null)
  const activeGradient = 'from-cyan-400 to-violet-500'
  const navButtonBaseClass = 'relative flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-300 group active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-900'

  const navItems = [
    { path: '/', icon: '🏠', label: '首页' },
    { path: '/mood-journal', icon: '📝', label: '日志' },
    { path: '/exercises', icon: '🧘‍♀️', label: '练习' },
    { path: '/history', icon: '📚', label: '历史' },
  ]

  const handleLogout = () => {
    if (window.confirm('确定要退出登录吗？')) {
      onLogout()
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const root = document.documentElement
    const navElement = navRef.current

    if (!root || !navElement) {
      return undefined
    }

    const syncNavHeight = () => {
      const { height } = navElement.getBoundingClientRect()

      if (height > 0) {
        root.style.setProperty(NAV_HEIGHT_CSS_VAR, `${Math.ceil(height)}px`)
      }
    }

    syncNavHeight()

    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(syncNavHeight)
      resizeObserver.observe(navElement)

      return () => {
        resizeObserver.disconnect()
      }
    }

    window.addEventListener('resize', syncNavHeight)
    return () => {
      window.removeEventListener('resize', syncNavHeight)
    }
  }, [])

  return (
    <nav
      ref={navRef}
      className="fixed bottom-0 left-0 right-0 z-50 px-4 md:px-6"
      style={{ height: DEFAULT_NAV_HEIGHT }}
    >
      <div className="relative h-full max-w-6xl mx-auto">
        <div className="absolute inset-0 rounded-t-3xl bg-gradient-to-r from-slate-900/86 via-indigo-900/72 to-slate-900/86 backdrop-blur-md border border-white/15 shadow-[0_-8px_28px_rgba(30,41,59,0.4)]" />

        {/* 顶部装饰线 */}
        <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-cyan-300 to-transparent opacity-70 rounded-full" />

        <div
          className="relative h-full flex items-center justify-around px-2 pt-3"
          style={{ paddingBottom: SAFE_AREA_BOTTOM }}
        >
          {navItems.map(({ path, icon, label }) => {
            const isActive = location.pathname === path
            return (
              <button
                key={path}
                type="button"
                onClick={() => navigate(path)}
                aria-current={isActive ? 'page' : undefined}
                className={`${navButtonBaseClass} ${
                  isActive
                    ? 'transform -translate-y-1 shadow-[0_8px_20px_rgba(56,189,248,0.22)]'
                    : 'hover:transform hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(99,102,241,0.2)]'
                }`}
              >
                {/* 活跃状态背景 */}
                {isActive && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${activeGradient} opacity-20 rounded-xl`} />
                )}

                {/* 图标容器 */}
                <div className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  isActive
                    ? `bg-gradient-to-r ${activeGradient} shadow-[0_8px_18px_rgba(56,189,248,0.35)]`
                    : 'bg-white/10 border border-white/10 group-hover:bg-white/20 group-hover:border-cyan-300/30'
                }`}>
                  <span className={`text-lg ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>
                    {icon}
                  </span>

                  {/* 活跃状态光晕 */}
                  {isActive && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${activeGradient} opacity-30 rounded-lg blur-sm animate-pulse`} />
                  )}
                </div>

                {/* 标签 */}
                <span className={`text-xs mt-1 font-medium transition-colors duration-300 ${
                  isActive ? 'text-white' : 'text-white/60 group-hover:text-white/80'
                }`}>
                  {label}
                </span>

                {/* 活跃状态指示点 */}
                {isActive && (
                  <div className="absolute -top-1 w-1 h-1 bg-cyan-300 rounded-full animate-pulse" />
                )}
              </button>
            )
          })}

          {/* 退出按钮 */}
          <button
            type="button"
            onClick={handleLogout}
            className={`${navButtonBaseClass} hover:transform hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(99,102,241,0.2)]`}
          >
            <div className="relative w-8 h-8 rounded-lg flex items-center justify-center bg-white/10 border border-white/10 group-hover:bg-gradient-to-r group-hover:from-cyan-400/25 group-hover:to-violet-500/25 group-hover:border-cyan-300/35 transition-all duration-300">
              <span className="text-lg text-white/70 group-hover:text-cyan-100">
                🚪
              </span>
            </div>
            <span className="text-xs mt-1 font-medium text-white/60 group-hover:text-cyan-100 transition-colors duration-300">
              退出
            </span>
          </button>
        </div>

        {/* 底部装饰 */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-14 h-1 bg-gradient-to-r from-transparent via-indigo-200/35 to-transparent rounded-full" />
      </div>
    </nav>
  )
}

export default Navigation
