import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthForm from '../components/Auth/AuthForm'
import { login } from '../services/auth'

const Login = ({ setIsAuthenticated }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  
  const handleLogin = async (email, password) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await login(email, password)
      localStorage.setItem('token', data.access_token)
      setIsAuthenticated(true)
      navigate('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      setError(error.response?.data?.detail || 'Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <AuthForm
      title="Sign in to your account"
      buttonText="Sign in"
      onSubmit={handleLogin}
      isLogin={true}
      isLoading={isLoading}
      error={error}
    />
  )
}

export default Login
