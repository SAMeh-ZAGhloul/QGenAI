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

    console.log('Registration attempt with email:', email)

    try {
      await register(email, password)
      console.log('Registration successful, redirecting to login')
      navigate('/login', { state: { message: 'Registration successful. Please log in.' } })
    } catch (error) {
      console.error('Registration error in component:', error)
      setError(error.message || 'Registration failed')
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
