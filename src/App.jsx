import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// 导入页面组件
import OnboardingPage from './components/OnboardingPage'
import AuthPage from './components/AuthPage'
import HomePage from './components/HomePage'
import MoodJournalPage from './components/MoodJournalPage'
import ExercisePage from './components/ExercisePage'
import HistoryPage from './components/HistoryPage'
import Navigation from './components/Navigation'

// 主应用组件
const App = () => {
  const [hasOnboarded, setHasOnboarded] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 检查是否已经完成引导和认证
    const hasCompletedOnboarding = localStorage.getItem('hasOnboarded')
    const authToken = localStorage.getItem('authToken')
    
    if (hasCompletedOnboarding) {
      setHasOnboarded(true)
    }
    
    if (authToken) {
      setIsAuthenticated(true)
    }
    
    setIsLoading(false)
  }, [])

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasOnboarded', 'true')
    setHasOnboarded(true)
  }

  const handleAuthSuccess = () => {
    localStorage.setItem('authToken', 'demo-token')
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    setIsAuthenticated(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/80">加载中...</p>
        </div>
      </div>
    )
  }

  if (!hasOnboarded) {
    return <OnboardingPage onComplete={handleOnboardingComplete} />
  }

  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />
  }

  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/mood-journal" element={<MoodJournalPage />} />
          <Route path="/exercises" element={<ExercisePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Navigation onLogout={handleLogout} />
      </div>
    </Router>
  )
}

export default App

