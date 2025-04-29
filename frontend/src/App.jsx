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
  
  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token')
    if (token) {
      setIsAuthenticated(true)
    }
  }, [])
  
  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />
    }
    
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
