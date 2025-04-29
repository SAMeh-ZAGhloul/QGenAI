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
      const data = await login(email, password)

      // Double-check that the token was stored
      const storedToken = localStorage.getItem('token')
      console.log('Token in localStorage after login:', storedToken ? 'Token exists' : 'No token')

      if (storedToken) {
        // Force authentication state update
        setIsAuthenticated(true)

        // Create a custom event to notify the app about authentication change
        window.dispatchEvent(new Event('auth-change'))

        console.log('Authentication state updated, navigating to dashboard')
        navigate('/dashboard')
      } else {
        console.error('Token was not stored in localStorage')
        setError('Authentication failed: Token storage issue')
      }
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
