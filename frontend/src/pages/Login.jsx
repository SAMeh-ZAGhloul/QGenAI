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
      // Call the login function which now handles token storage
      await login(email, password)

      // The login function now handles token storage and verification
      // It will only resolve if the token was successfully stored

      // Force authentication state update
      setIsAuthenticated(true)

      console.log('Authentication state updated, navigating to dashboard')
      navigate('/dashboard')
    } catch (error) {
      console.error('Login error in component:', error)
      setError(error.message || 'Invalid email or password')
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
