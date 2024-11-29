import axios from 'axios'
import { useAuth } from '@/hooks/use-auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333',
})

api.interceptors.request.use((config) => {
  const { token } = useAuth.getState()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuth.getState().logout()
    }
    return Promise.reject(error)
  }
)

export { api }
