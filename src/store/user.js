import { defineStore } from 'pinia';
export const useUserStore = defineStore('user', {
  state: () => ({ user: null, token: null }),
  actions: {
    setUser(u, token) { this.user = u; this.token = token; localStorage.setItem('token', token); },
    logout() { this.user = null; this.token = null; localStorage.removeItem('token'); }
  }
});
