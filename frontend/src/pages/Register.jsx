import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthForm from '../components/Auth/AuthForm'
import { register } from '../services/auth'

const Register = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  
  const handleRegister = async (email, password) => {
    setIsLoading(true)
    setError(null)
    
    try {
      await register(email, password)
      navigate('/login', { state: { message: 'Registration successful. Please log in.' } })
    } catch (error) {
      console.error('Registration error:', error)
      setError(error.response?.data?.detail || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <AuthForm
      title="Create a new account"
      buttonText="Register"
      onSubmit={handleRegister}
      isLogin={false}
      isLoading={isLoading}
      error={error}
    />
  )
}

export default Register
