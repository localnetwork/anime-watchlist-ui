import { defineBoot } from '#q-app'
import axios from 'axios'
import { Cookies } from 'quasar'

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || 'http://lczc7ur3i4qrcl7wmwsgxged.15.235.244.182.sslip.io/api',
  timeout: 30000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || Cookies.get('token')

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
