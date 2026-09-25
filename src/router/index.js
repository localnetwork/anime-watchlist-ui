import { defineRouter } from '#q-app'
import { routes, handleHotUpdate } from 'vue-router/auto-routes'
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router'
import { useAuthStore } from '@/stores/auth-store'
import { useUiStore } from '@/stores/ui-store'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(({ store /*, ssrContext */ }) => {
  const createHistory = import.meta.env.QUASAR_SERVER
    ? createMemoryHistory
    : import.meta.env.QUASAR_VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE),
  })

  // Route guard: protect /manage/* (and any route flagged requiresAuth/permissions)
  Router.beforeEach((to) => {
    const authStore = useAuthStore(store)
    const uiStore = useUiStore(store)
    const requiresAuth = Boolean(to.meta?.requiresAuth)
    const requiredPermissions = to.meta?.permissions || []

    if (requiresAuth && !authStore.isAuthenticated) {
      uiStore.openAuthDialog('login', to.fullPath)
      return { path: '/' }
    }

    if (requiredPermissions.length && !authStore.hasAnyPermission(requiredPermissions)) {
      return { path: '/access-denied' }
    }

    return true
  })

  // enable HMR for it
  if (import.meta.hot) {
    handleHotUpdate(Router)
  }

  return Router
})
