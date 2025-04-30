import api from './api'

export const submitQuery = async (queryText) => {
  const response = await api.post('/queries/', {
    query_text: queryText,
  })

  return response.data
}

export const getQueries = async () => {
  const response = await api.get('/queries/')
  return response.data
}

export const getQuery = async (id) => {
  const response = await api.get(`/queries/${id}/`)
  return response.data
}
