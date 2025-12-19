import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'
import { CreateDeal } from './pages/CreateDeal'
import { Timeline } from './pages/Timeline'
import { Chat } from './pages/Chat'
import { Insights } from './pages/Insights'
import { isAuthenticated } from './lib/auth'

function App() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const auth = await isAuthenticated()
      setAuthenticated(auth)
    } catch (error) {
      setAuthenticated(false)
    }
  }

  if (authenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={authenticated ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={authenticated ? <Navigate to="/" /> : <Register />} />
        <Route
          path="/*"
          element={
            authenticated ? (
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/deals/new" element={<CreateDeal />} />
                  <Route path="/deals/:id" element={<Timeline />} />
                  <Route path="/deals/:id/chat" element={<Chat />} />
                  <Route path="/deals/:id/insights" element={<Insights />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App