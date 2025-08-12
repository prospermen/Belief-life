import { useLocation, useNavigate } from 'react-router-dom'

const Navigation = ({ onLogout }) => {
  const location = useLocation()
  const navigate = useNavigate()

  const navItems = [
    { path: '/', icon: '🏠', label: '首页', gradient: 'from-blue-400 to-cyan-500' },
    { path: '/mood-journal', icon: '📝', label: '日志', gradient: 'from-green-400 to-emerald-500' },
    { path: '/exercises', icon: '🧘‍♀️', label: '练习', gradient: 'from-purple-400 to-violet-500' },
    { path: '/history', icon: '📚', label: '历史', gradient: 'from-orange-400 to-red-500' },
  ]

  const handleLogout = () => {
    if (window.confirm('确定要退出登录吗？')) {
      onLogout()
    }
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* 背景模糊效果 */}
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md border-t border-white/10" />
      
      {/* 顶部装饰线 */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-60" />
      
      <div className="relative flex items-center justify-around py-3 px-2">
        {navItems.map(({ path, icon, label, gradient }) => {
          const isActive = location.pathname === path
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`relative flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-300 group ${
                isActive ? 'transform -translate-y-1' : 'hover:transform hover:-translate-y-0.5'
              }`}
            >
              {/* 活跃状态背景 */}
              {isActive && (
                <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-20 rounded-xl`} />
              )}
              
              {/* 图标容器 */}
              <div className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                isActive 
                  ? `bg-gradient-to-r ${gradient} shadow-lg` 
                  : 'bg-white/10 group-hover:bg-white/20'
              }`}>
                <span className={`text-lg ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>
                  {icon}
                </span>
                
                {/* 活跃状态光晕 */}
                {isActive && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-30 rounded-lg blur-sm animate-pulse`} />
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
                <div className="absolute -top-1 w-1 h-1 bg-yellow-400 rounded-full animate-pulse" />
              )}
            </button>
          )
        })}
        
        {/* 退出按钮 */}
        <button
          onClick={handleLogout}
          className="relative flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-300 group hover:transform hover:-translate-y-0.5"
        >
          <div className="relative w-8 h-8 rounded-lg flex items-center justify-center bg-white/10 group-hover:bg-red-500/20 transition-all duration-300">
            <span className="text-lg text-white/70 group-hover:text-red-300">
              🚪
            </span>
          </div>
          <span className="text-xs mt-1 font-medium text-white/60 group-hover:text-red-300 transition-colors duration-300">
            退出
          </span>
        </button>
      </div>
      
      {/* 底部装饰 */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" />
    </nav>
  )
}

export default Navigation

