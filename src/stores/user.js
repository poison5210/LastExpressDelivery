import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref(null)
  const token = ref(localStorage.getItem('token') || '')
  
  const isLoggedIn = computed(() => !!token.value)
  const userRole = computed(() => currentUser.value?.role || '')
  
  function login(credentials) {
    // 模拟API调用
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = {
          admin: {
            id: 1,
            username: 'admin',
            name: '管理员',
            role: 'admin',
            email: 'admin@example.com',
            phone: '13800138000',
            department: '技术部',
            joinTime: '2024-01-01',
            avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
          },
          courier: {
            id: 2,
            username: 'courier',
            name: '张三',
            role: 'courier',
            email: 'courier@example.com',
            phone: '13800138001',
            department: '配送部',
            joinTime: '2024-01-01',
            avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
          }
        }

        const user = users[credentials.username]
        if (user && credentials.password === '123456') {
          const newToken = 'mock_token_' + Date.now()
          token.value = newToken
          localStorage.setItem('token', newToken)
          currentUser.value = user
          resolve(user)
        } else {
          reject(new Error('用户名或密码错误'))
        }
      }, 1000)
    })
  }

  function register(userData) {
    // 模拟注册API调用
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 这里可以添加实际的注册逻辑
        resolve()
      }, 1000)
    })
  }

  function updateUser(userData) {
    Object.assign(currentUser.value, userData)
  }
  
  function setToken(newToken) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }
  
  function logout() {
    currentUser.value = null
    token.value = ''
    localStorage.removeItem('token')
  }
  
  return {
    currentUser,
    token,
    isLoggedIn,
    userRole,
    login,
    register,
    updateUser,
    setToken,
    logout
  }
})