import { defineBoot } from '#q-app'
import axios from 'axios'
import { Cookies } from 'quasar'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
})

api.interceptors.request.use((config) => {
  const token = Cookies.get('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
