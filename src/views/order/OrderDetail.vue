<template>
  <div class="order-detail">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>订单详情</span>
          <el-tag :type="statusType">{{ order.status }}</el-tag>
        </div>
      </template>
      
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单编号">{{ order.id }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ order.createTime }}</el-descriptions-item>
        <el-descriptions-item label="寄件人">{{ order.senderName }}</el-descriptions-item>
        <el-descriptions-item label="寄件人电话">{{ order.senderPhone }}</el-descriptions-item>
        <el-descriptions-item label="寄件地址" :span="2">{{ order.senderAddress }}</el-descriptions-item>
        <el-descriptions-item label="收件人">{{ order.receiverName }}</el-descriptions-item>
        <el-descriptions-item label="收件人电话">{{ order.receiverPhone }}</el-descriptions-item>
        <el-descriptions-item label="收件地址" :span="2">{{ order.receiverAddress }}</el-descriptions-item>
        <el-descriptions-item label="包裹重量">{{ order.weight }}kg</el-descriptions-item>
        <el-descriptions-item label="运费">¥{{ order.amount }}</el-descriptions-item>
      </el-descriptions>
      
      <div class="tracking-timeline mt-4">
        <h3>物流追踪</h3>
        <el-timeline>
          <el-timeline-item
            v-for="track in trackingInfo"
            :key="track.time"
            :type="track.type"
            :timestamp="track.time">
            {{ track.content }}
          </el-timeline-item>
        </el-timeline>
      </div>
      
      <div class="order-actions mt-4">
        <el-button-group>
          <el-button type="primary" @click="updateStatus('已接单')" :disabled="!canAccept">接单</el-button>
          <el-button type="success" @click="updateStatus('已送达')" :disabled="!canComplete">完成配送</el-button>
          <el-button type="danger" @click="handleException" :disabled="!canReport">报告异常</el-button>
        </el-button-group>
      </div>
    </el-card>
    
    <!-- 异常报告对话框 -->
    <el-dialog
      v-model="exceptionDialogVisible"
      title="报告异常"
      width="500px">
      <el-form :model="exceptionForm" label-width="100px">
        <el-form-item label="异常类型">
          <el-select v-model="exceptionForm.type" placeholder="请选择异常类型">
            <el-option label="包裹损坏" value="damaged" />
            <el-option label="无法联系收件人" value="unreachable" />
            <el-option label="地址错误" value="wrong_address" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="异常描述">
          <el-input
            v-model="exceptionForm.description"
            type="textarea"
            rows="3"
            placeholder="请详细描述异常情况" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="exceptionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitException">提交</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useOrderStore } from '../../stores/order'

const route = useRoute()
const orderStore = useOrderStore()

// 模拟订单数据
const order = ref({
  id: 'ORD001',
  createTime: '2024-02-20 10:00',
  senderName: '张三',
  senderPhone: '13800138000',
  senderAddress: '北京市朝阳区某某街道1号',
  receiverName: '李四',
  receiverPhone: '13900139000',
  receiverAddress: '上海市浦东新区某某路2号',
  weight: 2.5,
  amount: 50,
  status: '待处理'
})

const trackingInfo = ref([
  {
    time: '2024-02-20 10:00',
    content: '订单已创建',
    type: 'primary'
  },
  {
    time: '2024-02-20 11:00',
    content: '快递员已接单',
    type: 'success'
  }
])

const statusType = computed(() => {
  const statusMap = {
    '待处理': 'info',
    '已接单': 'warning',
    '已送达': 'success',
    '异常': 'danger'
  }
  return statusMap[order.value.status] || 'info'
})

const canAccept = computed(() => order.value.status === '待处理')
const canComplete = computed(() => order.value.status === '已接单')
const canReport = computed(() => !['已送达', '异常'].includes(order.value.status))

const exceptionDialogVisible = ref(false)
const exceptionForm = ref({
  type: '',
  description: ''
})

function updateStatus(status) {
  order.value.status = status
  trackingInfo.value.push({
    time: new Date().toLocaleString(),
    content: `订单${status}`,
    type: 'success'
  })
}

function handleException() {
  exceptionDialogVisible.value = true
}

function submitException() {
  order.value.status = '异常'
  trackingInfo.value.push({
    time: new Date().toLocaleString(),
    content: `订单异常：${exceptionForm.value.description}`,
    type: 'danger'
  })
  exceptionDialogVisible.value = false
  exceptionForm.value = { type: '', description: '' }
}
</script>

<style scoped>
.order-detail {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tracking-timeline {
  margin-top: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.mt-4 {
  margin-top: 20px;
}

.order-actions {
  display: flex;
  justify-content: center;
}
</style>