import api from './api'
import axios from 'axios'

export const login = async (email, password) => {
  try {
    // Use native fetch API for more direct control
    console.log('Attempting login with email:', email)

    const formData = new URLSearchParams()
    formData.append('username', email)
    formData.append('password', password)

    console.log('Login request payload:', formData.toString())

    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Login failed with status:', response.status)
      console.error('Error response:', errorData)
      throw new Error(errorData.detail || 'Login failed')
    }

    const data = await response.json()
    console.log('Login successful, received data:', data)

    // Explicitly store token in localStorage
    if (data && data.access_token) {
      console.log('Storing token in localStorage')
      localStorage.setItem('token', data.access_token)
    } else {
      console.error('No access_token in response data')
    }

    return data
  } catch (error) {
    console.error('Login error:', error.message)
    throw error
  }
}

export const register = async (email, password) => {
  try {
    console.log('Attempting registration with email:', email)

    const response = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Registration failed with status:', response.status)
      console.error('Error response:', errorData)
      throw new Error(errorData.detail || 'Registration failed')
    }

    const data = await response.json()
    console.log('Registration successful')
    return data
  } catch (error) {
    console.error('Registration error:', error.message)
    throw error
  }
}

export const logout = () => {
  console.log('Logging out, removing token from localStorage')
  localStorage.removeItem('token')

  // Dispatch custom auth-change event
  console.log('Dispatching auth-change event')
  window.dispatchEvent(new Event('auth-change'))

  // Also dispatch storage event for other tabs
  window.dispatchEvent(new Event('storage'))

  return true
}
