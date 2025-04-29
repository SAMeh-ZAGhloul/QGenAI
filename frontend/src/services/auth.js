import api from './api'
import axios from 'axios'

export const login = async (email, password) => {
  // Use URLSearchParams for x-www-form-urlencoded format
  const formData = new URLSearchParams()
  formData.append('username', email)
  formData.append('password', password)

  console.log('Login request payload:', formData.toString())

  try {
    // Use direct axios call instead of api client
    const response = await axios.post('/api/v1/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    console.log('Login response:', response.data)
    return response.data
  } catch (error) {
    console.error('Login error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    })
    throw error
  }
}

export const register = async (email, password) => {
  const response = await api.post('/auth/register', {
    email,
    password,
  })

  return response.data
}

export const logout = () => {
  localStorage.removeItem('token')
  // Create a storage event to notify other tabs
  window.dispatchEvent(new Event('storage'))
  return true
}
