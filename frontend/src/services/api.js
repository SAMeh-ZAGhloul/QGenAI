import axios from 'axios'

const API_URL = '/api/v1'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    console.log('Request interceptor - Token in localStorage:', token ? 'Token exists' : 'No token')

    if (token) {
      try {
        // Make sure token is properly formatted
        const formattedToken = String(token).trim()

        // Set the Authorization header
        config.headers['Authorization'] = `Bearer ${formattedToken}`
        console.log('Added Authorization header:', `Bearer ${formattedToken.substring(0, 10)}...`)

        // Ensure Content-Type is set (unless it's multipart/form-data)
        if (!config.headers['Content-Type'] && !config.headers.get) {
          config.headers['Content-Type'] = 'application/json'
        }

        // Log the full headers for debugging
        console.log('Request headers:', JSON.stringify(config.headers))
      } catch (e) {
        console.error('Error setting auth header:', e)
      }
    } else {
      console.warn('No token found in localStorage, request will be unauthorized')
    }

    console.log('Request URL:', config.url)
    console.log('Request method:', config.method)
    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('Response successful:', response.status, response.config.url)
    return response
  },
  (error) => {
    console.error('API Error:', error.message)

    if (error.response) {
      console.error('Response status:', error.response.status)
      console.error('Response data:', error.response.data)

      // Handle 401 Unauthorized errors
      if (error.response.status === 401) {
        console.warn('Unauthorized access detected, clearing token and redirecting to login')
        localStorage.removeItem('token')

        // Dispatch auth change event
        window.dispatchEvent(new Event('auth-change'))

        // Redirect to login page
        window.location.href = '/login'
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request)
    }

    return Promise.reject(error)
  }
)

export default api
