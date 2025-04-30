import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import DocumentUpload from './pages/DocumentUpload'
import QueryInterface from './pages/QueryInterface'
import Layout from './components/Layout/Layout'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Function to check authentication status
  const checkAuthStatus = () => {
    const token = localStorage.getItem('token')
    console.log('Checking auth status - Token in localStorage:', token ? 'Token exists' : 'No token')

    if (token && token.trim() !== '') {
      console.log('Setting isAuthenticated to true')
      setIsAuthenticated(true)

      // Verify token format
      try {
        const tokenValue = token.trim()
        console.log('Token value (first 10 chars):', tokenValue.substring(0, 10) + '...')
      } catch (e) {
        console.error('Error processing token:', e)
      }
    } else {
      console.log('No token found or empty token, user is not authenticated')
      setIsAuthenticated(false)
      // Clear any potentially invalid token
      localStorage.removeItem('token')
    }

    setIsLoading(false)
  }

  useEffect(() => {
    // Check if user is authenticated on initial load
    checkAuthStatus()

    // Set up event listeners for auth changes
    const handleAuthChange = () => {
      console.log('Auth change event detected')
      checkAuthStatus()
    }

    // Listen for storage events (for changes in other tabs)
    window.addEventListener('storage', handleAuthChange)

    // Listen for our custom auth-change event
    window.addEventListener('auth-change', handleAuthChange)

    return () => {
      window.removeEventListener('storage', handleAuthChange)
      window.removeEventListener('auth-change', handleAuthChange)
    }
  }, [])

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    console.log('ProtectedRoute - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading)

    // Show loading indicator while checking authentication
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      )
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login')
      return <Navigate to="/login" />
    }

    console.log('User authenticated, rendering protected content')
    return children
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={<Login setIsAuthenticated={setIsAuthenticated} />}
      />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <Layout>
              <DocumentUpload />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/query"
        element={
          <ProtectedRoute>
            <Layout>
              <QueryInterface />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
