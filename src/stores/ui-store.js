import { defineStore, acceptHMRUpdate } from 'pinia'

export const useUiStore = defineStore('ui', {
  state: () => ({
    authDialogOpen: false,
    authDialogMode: 'login',
    authRedirect: null,
  }),

  actions: {
    openAuthDialog(mode = 'login', redirect = null) {
      this.authDialogMode = mode
      this.authRedirect = redirect
      this.authDialogOpen = true
    },

    closeAuthDialog() {
      this.authDialogOpen = false
      this.authRedirect = null
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUiStore, import.meta.hot))
}
