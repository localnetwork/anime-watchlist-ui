import { defineStore, acceptHMRUpdate } from 'pinia'
import { Cookies } from 'quasar'
import { api } from '../boot/axios'

const TOKEN_COOKIE = 'token'
const TOKEN_COOKIE_DAYS = 7

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: Cookies.get(TOKEN_COOKIE) || null,
    user: JSON.parse(localStorage.getItem('user') || 'null'),
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    permissions: (state) => state.user?.permissions || [],
  },

  actions: {
    hasPermission(permission) {
      return this.permissions.includes(permission)
    },

    hasAnyPermission(permissionList = []) {
      return permissionList.some((permission) => this.permissions.includes(permission))
    },

    setSession(token, user) {
      this.token = token
      this.user = user
      Cookies.set(TOKEN_COOKIE, token, { expires: TOKEN_COOKIE_DAYS, sameSite: 'Lax', path: '/' })
      localStorage.setItem('user', JSON.stringify(user))
    },

    setUser(user) {
      this.user = { ...this.user, ...user }
      localStorage.setItem('user', JSON.stringify(this.user))
    },

    async fetchMe() {
      const { data } = await api.get('/auth/me')
      this.setUser(data)
      return data
    },

    async updateProfile(payload) {
      const { data } = await api.put('/auth/me', payload)
      this.setUser(data)
      return data
    },

    async login({ email, password }) {
      const { data } = await api.post('/auth/login', { email, password })
      this.setSession(data.token, data.user)
      return data
    },

    async register({ name, email, password }) {
      const { data } = await api.post('/auth/register', { name, email, password })
      this.setSession(data.token, data.user)
      return data
    },

    logout() {
      this.token = null
      this.user = null
      Cookies.remove(TOKEN_COOKIE, { path: '/' })
      localStorage.removeItem('user')
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
