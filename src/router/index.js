import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../store/user';

const Login = () => import('../pages/Login.vue');
const Dashboard = () => import('../pages/Dashboard.vue');
const Leaves = () => import('../pages/Leaves.vue');

const routes = [
  { path: '/login', name: 'login', component: Login, meta: { public: true } },
  { path: '/', name: 'dashboard', component: Dashboard },
  { path: '/leaves', name: 'leaves', component: Leaves },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  const token = userStore.token || localStorage.getItem('token');
  if (!to.meta.public && !token) {
    return next({ name: 'login' });
  }
  next();
});

export default router;