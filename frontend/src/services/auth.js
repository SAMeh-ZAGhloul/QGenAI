import api from './api'

export const login = async (email, password) => {
  // Use URLSearchParams for x-www-form-urlencoded format
  const formData = new URLSearchParams()
  formData.append('username', email)
  formData.append('password', password)

  const response = await api.post('/auth/login', formData.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  return response.data
}

export const register = async (email, password) => {
  const response = await api.post('/auth/register', {
    email,
    password,
  })

  return response.data
}
