import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useOrderStore = defineStore('order', () => {
  const orders = ref([])
  const loading = ref(false)
  
  const pendingOrders = computed(() => 
    orders.value.filter(order => order.status === '待处理')
  )
  
  const completedOrders = computed(() => 
    orders.value.filter(order => order.status === '已送达')
  )
  
  function addOrder(order) {
    orders.value.push(order)
  }
  
  function updateOrderStatus(orderId, status) {
    const order = orders.value.find(o => o.id === orderId)
    if (order) {
      order.status = status
    }
  }
  
  return {
    orders,
    loading,
    pendingOrders,
    completedOrders,
    addOrder,
    updateOrderStatus
  }
})