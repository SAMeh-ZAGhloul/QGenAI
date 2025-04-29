import api from './api'
import axios from 'axios'

export const login = (email, password) => {
  return new Promise((resolve, reject) => {
    console.log('Attempting login with email:', email)

    // Create XMLHttpRequest for more direct control
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/v1/auth/login', true)
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')

    // Set up response handler
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          try {
            const data = JSON.parse(xhr.responseText)
            console.log('Login successful, received data:', data)

            if (data && data.access_token) {
              console.log('Storing token in localStorage')
              // Directly set the token in localStorage
              window.localStorage.setItem('token', data.access_token)

              // Verify token was stored
              const storedToken = window.localStorage.getItem('token')
              console.log('Verification - Token in localStorage:', storedToken ? 'Token exists' : 'No token')

              if (!storedToken) {
                console.error('Failed to store token in localStorage')
                reject(new Error('Failed to store authentication token'))
                return
              }

              // Dispatch auth change event
              window.dispatchEvent(new Event('auth-change'))

              resolve(data)
            } else {
              console.error('No access_token in response data')
              reject(new Error('Authentication failed: No access token received'))
            }
          } catch (e) {
            console.error('Error parsing login response:', e)
            reject(new Error('Failed to parse login response'))
          }
        } else {
          console.error('Login failed with status:', xhr.status)
          try {
            const errorData = JSON.parse(xhr.responseText)
            console.error('Error response:', errorData)
            reject(new Error(errorData.detail || 'Login failed'))
          } catch (e) {
            reject(new Error(`Login failed with status ${xhr.status}`))
          }
        }
      }
    }

    // Handle network errors
    xhr.onerror = function() {
      console.error('Network error during login request')
      reject(new Error('Network error during login request'))
    }

    // Prepare and send the request
    const formData = new URLSearchParams()
    formData.append('username', email)
    formData.append('password', password)

    console.log('Login request payload:', formData.toString())
    xhr.send(formData.toString())
  })
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
  window.localStorage.removeItem('token')

  // Verify token was removed
  const token = window.localStorage.getItem('token')
  console.log('Verification after logout - Token in localStorage:', token ? 'Token still exists' : 'Token removed')

  // Dispatch custom auth-change event
  console.log('Dispatching auth-change event')
  window.dispatchEvent(new Event('auth-change'))

  // Also dispatch storage event for other tabs
  window.dispatchEvent(new Event('storage'))

  return true
}
