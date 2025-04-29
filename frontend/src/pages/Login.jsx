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

    console.log('Login attempt with email:', email)

    try {
      const data = await login(email, password)
      console.log('Login successful, received data:', data)

      if (data && data.access_token) {
        console.log('Token received, storing in localStorage')
        localStorage.setItem('token', data.access_token)

        // Force authentication state update
        setIsAuthenticated(true)

        // Add a small delay before navigation to ensure state is updated
        setTimeout(() => {
          console.log('Navigating to dashboard')
          navigate('/dashboard')
        }, 100)
      } else {
        console.error('No access token in response')
        setError('Authentication failed: No access token received')
      }
    } catch (error) {
      console.error('Login error in component:', error)
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
