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
      config.headers.Authorization = `Bearer ${token}`
      console.log('Added Authorization header:', `Bearer ${token.substring(0, 10)}...`)
    }
    console.log('Request URL:', config.url)
    console.log('Request method:', config.method)
    return config
  },
  (error) => Promise.reject(error)
)

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
