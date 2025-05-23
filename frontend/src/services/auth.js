import api from './api'
import axios from 'axios'

export const login = (email, password) => {
  return new Promise((resolve, reject) => {
    console.log('Attempting login with email:', email)

    // Use fetch instead of XMLHttpRequest
    const formData = new URLSearchParams()
    formData.append('username', email)
    formData.append('password', password)

    console.log('Login request payload:', formData.toString())

    fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
      credentials: 'same-origin', // Include cookies if any
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(errorData => {
            console.error('Login failed with status:', response.status)
            console.error('Error response:', errorData)
            throw new Error(errorData.detail || 'Login failed')
          })
        }
        return response.json()
      })
      .then(data => {
        console.log('Login successful, received data:', data)

        if (data && data.access_token) {
          console.log('Storing token in localStorage')

          try {
            // Clear any existing token first
            localStorage.removeItem('token')

            // Store the new token - ensure it's a string and trimmed
            const tokenValue = String(data.access_token).trim()
            localStorage.setItem('token', tokenValue)

            // Verify token was stored
            const storedToken = localStorage.getItem('token')
            console.log('Verification - Token in localStorage:', storedToken ? 'Token exists' : 'No token')
            console.log('Token value (first 10 chars):', storedToken ? storedToken.substring(0, 10) + '...' : 'None')

            if (!storedToken) {
              console.error('Failed to store token in localStorage')
              throw new Error('Failed to store authentication token')
            }

            // Test a simple API call to verify the token works
            console.log('Testing token with a simple API call')
            fetch('/api/v1/queries/', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${storedToken}`,
                'Content-Type': 'application/json'
              }
            })
              .then(response => {
                console.log('Token test response status:', response.status)
                if (!response.ok) {
                  console.warn('Token test failed with status:', response.status)
                } else {
                  console.log('Token test successful!')
                }
              })
              .catch(err => {
                console.warn('Token test request failed:', err)
              })

            // Dispatch auth change event
            window.dispatchEvent(new Event('auth-change'))

            resolve(data)
          } catch (storageError) {
            console.error('Error storing token:', storageError)
            throw new Error('Failed to store authentication token: ' + storageError.message)
          }
        } else {
          console.error('No access_token in response data')
          throw new Error('Authentication failed: No access token received')
        }
      })
      .catch(error => {
        console.error('Login error:', error)
        reject(error)
      })
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
