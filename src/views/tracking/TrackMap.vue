<template>
  <div class="track-map">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>实时位置追踪</span>
          <el-button-group>
            <el-button type="primary" @click="refreshLocation" :loading="refreshing">
              <el-icon><Refresh /></el-icon> 刷新位置
            </el-button>
            <el-button @click="centerMap">
              <el-icon><Aim /></el-icon> 居中显示
            </el-button>
          </el-button-group>
        </div>
      </template>
      
      <div class="map-container">
        <div id="container" class="amap-container"></div>
        
        <div class="delivery-info">
          <el-card>
            <template #header>
              <div class="info-header">
                <span>配送信息</span>
                <el-tag type="success">正在配送</el-tag>
              </div>
            </template>
            
            <el-descriptions direction="vertical" :column="1" border>
              <el-descriptions-item label="订单编号">
                {{ deliveryInfo.orderId }}
              </el-descriptions-item>
              <el-descriptions-item label="快递员">
                <div class="courier-info">
                  <el-avatar :size="32" :src="deliveryInfo.courierAvatar" />
                  <div class="courier-details">
                    <div>{{ deliveryInfo.courierName }}</div>
                    <div class="courier-phone">
                      {{ deliveryInfo.courierPhone }}
                      <el-button type="primary" link @click="handleCall">
                        <el-icon><Phone /></el-icon> 联系
                      </el-button>
                    </div>
                  </div>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="预计送达">
                {{ deliveryInfo.estimatedTime }}
              </el-descriptions-item>
              <el-descriptions-item label="当前位置">
                {{ deliveryInfo.currentLocation }}
              </el-descriptions-item>
            </el-descriptions>
            
            <div class="delivery-progress">
              <div class="progress-title">配送进度</div>
              <el-progress
                :percentage="deliveryInfo.progress"
                :status="deliveryInfo.progress >= 100 ? 'success' : ''"
                :stroke-width="10" />
              <div class="estimated-time">
                预计还需 {{ deliveryInfo.remainingTime }} 分钟
              </div>
            </div>
          </el-card>
        </div>
      </div>
      
      <!-- 配送路线信息 -->
      <div class="route-info mt-4">
        <el-collapse v-model="activeCollapse">
          <el-collapse-item title="配送路线详情" name="route">
            <el-timeline>
              <el-timeline-item
                v-for="(point, index) in routePoints"
                :key="index"
                :type="point.type"
                :timestamp="point.time">
                {{ point.location }}
                <div class="point-detail">{{ point.detail }}</div>
              </el-timeline-item>
            </el-timeline>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-card>
    
    <!-- 联系快递员对话框 -->
    <el-dialog
      v-model="contactDialogVisible"
      title="联系快递员"
      width="360px"
      center>
      <div class="contact-dialog-content">
        <el-avatar :size="64" :src="deliveryInfo.courierAvatar" />
        <h3>{{ deliveryInfo.courierName }}</h3>
        <p>{{ deliveryInfo.courierPhone }}</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="contactDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleCallPhone">
            <el-icon><Phone /></el-icon> 拨打电话
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { Refresh, Aim, Phone } from '@element-plus/icons-vue'
import AMapLoader from '@amap/amap-jsapi-loader'

const route = useRoute()
const map = ref(null)
const marker = ref(null)
const refreshing = ref(false)
const contactDialogVisible = ref(false)
const activeCollapse = ref(['route'])

const deliveryInfo = ref({
  orderId: 'ORD20240001',
  courierName: '王小明',
  courierPhone: '138****8888',
  courierAvatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
  estimatedTime: '今天 15:30前',
  currentLocation: '北京市朝阳区某某街道',
  progress: 65,
  remainingTime: 30
})

const routePoints = ref([
  {
    time: '11:00',
    location: '北京市朝阳区某某街道',
    detail: '快递员已取件，开始配送',
    type: 'primary'
  },
  {
    time: '11:15',
    location: '朝阳区配送中心',
    detail: '包裹已到达配送中心',
    type: 'success'
  },
  {
    time: '11:30',
    location: '正在配送中',
    detail: '距离目的地约3公里',
    type: 'warning'
  }
])

onMounted(async () => {
  try {
    const AMap = await AMapLoader.load({
      key: '你的高德地图Key',
      version: '2.0',
      plugins: ['AMap.ToolBar', 'AMap.Scale', 'AMap.Driving']
    })

    map.value = new AMap.Map('container', {
      zoom: 13,
      center: [116.397428, 39.90923]
    })

    marker.value = new AMap.Marker({
      position: [116.397428, 39.90923],
      icon: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png'
    })

    map.value.add(marker.value)
    map.value.addControl(new AMap.ToolBar())
    map.value.addControl(new AMap.Scale())

    // 绘制配送路线
    const driving = new AMap.Driving({
      map: map.value,
      panel: false
    })

    driving.search(
      [116.397428, 39.90923],
      [116.427428, 39.91923],
      (status, result) => {
        if (status === 'complete') {
          console.log('绘制配送路线成功')
        } else {
          console.error('配送路线规划失败')
        }
      }
    )
  } catch (e) {
    console.error('地图加载失败', e)
  }
})

onUnmounted(() => {
  if (map.value) {
    map.value.destroy()
  }
})

function refreshLocation() {
  refreshing.value = true
  // 模拟位置更新
  setTimeout(() => {
    const newPos = [
      116.397428 + (Math.random() - 0.5) * 0.01,
      39.90923 + (Math.random() - 0.5) * 0.01
    ]
    marker.value?.setPosition(newPos)
    refreshing.value = false
    
    // 更新进度
    deliveryInfo.value.progress = Math.min(100, deliveryInfo.value.progress + 5)
    deliveryInfo.value.remainingTime = Math.max(0, deliveryInfo.value.remainingTime - 5)
    
    ElMessage.success('位置已更新')
  }, 1000)
}

function centerMap() {
  const position = marker.value?.getPosition()
  if (position) {
    map.value?.setCenter(position)
    ElMessage.success('地图已居中')
  }
}

function handleCall() {
  contactDialogVisible.value = true
}

function handleCallPhone() {
  window.location.href = `tel:${deliveryInfo.value.courierPhone.replace(/\*/g, '0')}`
  contactDialogVisible.value = false
}
</script>

<style scoped>
.track-map {
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.map-container {
  position: relative;
  height: 500px;
  margin-top: 20px;
}

.amap-container {
  width: 100%;
  height: 100%;
}

.delivery-info {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 300px;
  z-index: 100;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.courier-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.courier-details {
  flex: 1;
}

.courier-phone {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #909399;
  font-size: 13px;
}

.delivery-progress {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.progress-title {
  margin-bottom: 10px;
  font-weight: bold;
}

.estimated-time {
  margin-top: 10px;
  text-align: center;
  color: #909399;
  font-size: 13px;
}

.route-info {
  margin-top: 20px;
}

.point-detail {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.contact-dialog-content {
  text-align: center;
  padding: 20px 0;
}

.contact-dialog-content h3 {
  margin: 10px 0 5px;
}

.contact-dialog-content p {
  color: #909399;
  margin: 0;
}

.mt-4 {
  margin-top: 20px;
}
</style>