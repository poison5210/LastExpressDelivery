import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'
import Dashboard from '../views/Dashboard.vue'
import Login from '../views/Login.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    redirect: '/dashboard',
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('../views/user/UserList.vue'),
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/roles',
    name: 'Roles',
    component: () => import('../views/user/RoleList.vue'),
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('../views/order/OrderList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/orders/create',
    name: 'CreateOrder',
    component: () => import('../views/order/CreateOrder.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/orders/:id',
    name: 'OrderDetail',
    component: () => import('../views/order/OrderDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/tracking',
    name: 'Tracking',
    component: () => import('../views/tracking/TrackOrder.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/tracking/map/:id',
    name: 'TrackMap',
    component: () => import('../views/tracking/TrackMap.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/system/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/system/Settings.vue'),
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/exception',
    name: 'Exception',
    component: () => import('../views/system/Exception.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
  } else if (to.meta.roles && !to.meta.roles.includes(userStore.currentUser?.role)) {
    next('/dashboard')
  } else if (to.path === '/login' && userStore.isLoggedIn) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router