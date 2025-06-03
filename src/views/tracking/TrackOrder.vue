<template>
  <div class="track-order">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>订单追踪</span>
        </div>
      </template>
      
      <el-form :inline="true" :model="trackForm" class="search-form">
        <el-form-item>
          <el-input
            v-model="trackForm.orderNumber"
            placeholder="请输入订单号"
            clearable
            @keyup.enter="trackOrder">
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="trackOrder" :loading="loading">
            <el-icon><Location /></el-icon> 追踪
          </el-button>
        </el-form-item>
      </el-form>
      
      <div v-if="orderInfo" class="order-info">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单编号">{{ orderInfo.id }}</el-descriptions-item>
          <el-descriptions-item label="当前状态">
            <el-tag :type="getStatusType(orderInfo.status)">{{ orderInfo.status }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="预计送达">{{ orderInfo.estimatedDelivery }}</el-descriptions-item>
          <el-descriptions-item label="已用时间">{{ orderInfo.usedTime }}</el-descriptions-item>
        </el-descriptions>
        
        <div class="delivery-progress">
          <el-steps :active="activeStep" finish-status="success" align-center>
            <el-step title="已下单" description="2024-02-20 10:00" />
            <el-step title="已接单" description="2024-02-20 10:30" />
            <el-step title="配送中" description="2024-02-20 11:00" />
            <el-step title="已送达" description="待完成" />
          </el-steps>
        </div>
        
        <div class="tracking-map" v-if="showMap">
          <div ref="mapContainer" style="height: 300px;"></div>
        </div>
        
        <div class="tracking-timeline">
          <el-timeline>
            <el-timeline-item
              v-for="(activity, index) in tracking"
              :key="index"
              :type="activity.type"
              :color="activity.color"
              :timestamp="activity.time"
              :hollow="activity.hollow">
              <h4>{{ activity.title }}</h4>
              <p>{{ activity.content }}</p>
              <p v-if="activity.location" class="location-text">
                <el-icon><Location /></el-icon>
                {{ activity.location }}
              </p>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
      
      <div v-else-if="searched" class="no-result">
        <el-empty description="未找到相关订单信息" />
      </div>
      
      <div v-else class="search-hint">
        <el-empty description="请输入订单号进行查询">
          <template #image>
            <el-icon :size="60"><Search /></el-icon>
          </template>
        </el-empty>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Search, Location } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import AMapLoader from '@amap/amap-jsapi-loader'

const trackForm = ref({
  orderNumber: ''
})

const loading = ref(false)
const searched = ref(false)
const showMap = ref(false)
const mapContainer = ref(null)
const map = ref(null)
const activeStep = ref(2)

const orderInfo = ref({
  id: 'ORD20240001',
  status: '配送中',
  estimatedDelivery: '今天 15:30前',
  usedTime: '2小时30分钟'
})

const tracking = ref([
  {
    time: '2024-02-20 11:00',
    title: '开始配送',
    content: '快递员王师傅已开始配送',
    location: '北京市朝阳区某某街道',
    type: 'primary',
    color: '#409EFF'
  },
  {
    time: '2024-02-20 10:30',
    title: '已到达配送站',
    content: '包裹已到达朝阳区配送站',
    location: '北京市朝阳区配送中心',
    type: 'success',
    color: '#67C23A'
  },
  {
    time: '2024-02-20 10:00',
    title: '订单已创建',
    content: '系统已接收订单信息',
    type: 'info',
    color: '#909399'
  }
])

onMounted(async () => {
  if (showMap.value) {
    try {
      const AMap = await AMapLoader.load({
        key: '你的高德地图Key',
        version: '2.0',
        plugins: ['AMap.ToolBar', 'AMap.Scale']
      })

      map.value = new AMap.Map(mapContainer.value, {
        zoom: 13,
        center: [116.397428, 39.90923]
      })

      const marker = new AMap.Marker({
        position: [116.397428, 39.90923]
      })

      map.value.add(marker)
      map.value.addControl(new AMap.ToolBar())
      map.value.addControl(new AMap.Scale())
    } catch (e) {
      console.error('地图加载失败', e)
    }
  }
})

onUnmounted(() => {
  if (map.value) {
    map.value.destroy()
  }
})

function getStatusType(status) {
  const statusMap = {
    '待处理': 'info',
    '已接单': 'warning',
    '配送中': 'primary',
    '已送达': 'success',
    '异常': 'danger'
  }
  return statusMap[status] || 'info'
}

function trackOrder() {
  if (!trackForm.value.orderNumber) {
    ElMessage.warning('请输入订单号')
    return
  }
  
  loading.value = true
  searched.value = true
  
  // 模拟API调用
  setTimeout(() => {
    loading.value = false
    showMap.value = true
  }, 1000)
}
</script>

<style scoped>
.track-order {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.order-info {
  margin-top: 20px;
}

.delivery-progress {
  margin: 30px 0;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.tracking-map {
  margin: 20px 0;
  border-radius: 4px;
  overflow: hidden;
}

.tracking-timeline {
  margin-top: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.location-text {
  color: #909399;
  margin-top: 5px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.search-hint {
  margin: 40px 0;
  text-align: center;
}

.no-result {
  margin: 40px 0;
  text-align: center;
}
</style>