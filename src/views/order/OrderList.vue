<template>
  <div class="order-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>订单管理</span>
          <el-button type="primary" @click="$router.push('/orders/create')">创建订单</el-button>
        </div>
      </template>
      
      <el-form :inline="true" class="search-form">
        <el-form-item label="订单号">
          <el-input v-model="searchForm.orderId" placeholder="请输入订单号" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option
              v-for="item in orderStatus"
              :key="item.value"
              :label="item.label"
              :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            :shortcuts="dateShortcuts" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
      
      <el-table
        v-loading="loading"
        :data="filteredOrders"
        style="width: 100%"
        border
        stripe>
        <el-table-column prop="id" label="订单编号" width="180" />
        <el-table-column prop="customer" label="客户" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="{ row }">
            ¥{{ row.amount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="weight" label="重量(kg)" width="100" />
        <el-table-column prop="address" label="收件地址" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleView(scope.row)">详情</el-button>
            <el-button 
              size="small"
              type="success"
              @click="handleTrack(scope.row)"
              :disabled="!canTrack(scope.row)">
              追踪
            </el-button>
            <el-button 
              size="small" 
              type="warning"
              @click="handlePrint(scope.row)"
              :disabled="!canPrint(scope.row)">
              打印
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="handleCancel(scope.row)"
              :disabled="!canCancel(scope.row)">
              取消
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </el-card>

    <!-- 打印预览对话框 -->
    <el-dialog
      v-model="printDialogVisible"
      title="打印预览"
      width="600px"
      append-to-body>
      <div class="print-preview" ref="printArea">
        <div class="print-header">
          <h2>快递运单</h2>
          <div class="barcode">{{ selectedOrder?.id }}</div>
        </div>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单编号">{{ selectedOrder?.id }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ selectedOrder?.createTime }}</el-descriptions-item>
          <el-descriptions-item label="寄件人">{{ selectedOrder?.senderName }}</el-descriptions-item>
          <el-descriptions-item label="寄件人电话">{{ selectedOrder?.senderPhone }}</el-descriptions-item>
          <el-descriptions-item label="寄件地址" :span="2">{{ selectedOrder?.senderAddress }}</el-descriptions-item>
          <el-descriptions-item label="收件人">{{ selectedOrder?.receiverName }}</el-descriptions-item>
          <el-descriptions-item label="收件人电话">{{ selectedOrder?.receiverPhone }}</el-descriptions-item>
          <el-descriptions-item label="收件地址" :span="2">{{ selectedOrder?.receiverAddress }}</el-descriptions-item>
          <el-descriptions-item label="包裹重量">{{ selectedOrder?.weight }}kg</el-descriptions-item>
          <el-descriptions-item label="运费">¥{{ selectedOrder?.amount }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="printDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="doPrint">打印</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const printDialogVisible = ref(false)
const selectedOrder = ref(null)
const printArea = ref(null)

const searchForm = ref({
  orderId: '',
  status: '',
  dateRange: []
})

const orderStatus = [
  { label: '待处理', value: '待处理' },
  { label: '已接单', value: '已接单' },
  { label: '配送中', value: '配送中' },
  { label: '已送达', value: '已送达' },
  { label: '已取消', value: '已取消' },
  { label: '异常', value: '异常' }
]

const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    }
  }
]

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 模拟订单数据
const orders = ref([
  {
    id: 'ORD20240001',
    customer: '张三',
    status: '待处理',
    amount: 100,
    weight: 2.5,
    address: '北京市朝阳区某某街道1号',
    createTime: '2024-02-20 10:00:00',
    senderName: '李四',
    senderPhone: '13800138000',
    senderAddress: '上海市浦东新区某某路2号',
    receiverName: '张三',
    receiverPhone: '13900139000',
    receiverAddress: '北京市朝阳区某某街道1号'
  },
  {
    id: 'ORD20240002',
    customer: '李四',
    status: '已送达',
    amount: 150,
    weight: 1.5,
    address: '上海市浦东新区某某路2号',
    createTime: '2024-02-20 09:30:00',
    senderName: '王五',
    senderPhone: '13700137000',
    senderAddress: '广州市天河区某某大道3号',
    receiverName: '李四',
    receiverPhone: '13600136000',
    receiverAddress: '上海市浦东新区某某路2号'
  }
])

const filteredOrders = computed(() => {
  return orders.value.filter(order => {
    if (searchForm.value.status && order.status !== searchForm.value.status) {
      return false
    }
    if (searchForm.value.orderId && !order.id.includes(searchForm.value.orderId)) {
      return false
    }
    // 可以添加更多筛选条件
    return true
  })
})

function getStatusType(status) {
  const statusMap = {
    '待处理': 'info',
    '已接单': 'warning',
    '配送中': 'primary',
    '已送达': 'success',
    '已取消': 'danger',
    '异常': 'danger'
  }
  return statusMap[status] || 'info'
}

function handleView(row) {
  router.push(`/orders/${row.id}`)
}

function handleTrack(row) {
  router.push(`/tracking/map/${row.id}`)
}

function handlePrint(row) {
  selectedOrder.value = row
  printDialogVisible.value = true
}

function doPrint() {
  const content = printArea.value.innerHTML
  const printWindow = window.open('', '_blank')
  printWindow.document.write(`
    <html>
      <head>
        <title>打印运单</title>
        <style>
          body { font-family: Arial, sans-serif; }
          .print-header { text-align: center; margin-bottom: 20px; }
          .barcode { margin: 10px 0; }
        </style>
      </head>
      <body>${content}</body>
    </html>
  `)
  printWindow.document.close()
  printWindow.print()
  printDialogVisible.value = false
}

function handleCancel(row) {
  ElMessageBox.confirm(
    '确定要取消该订单吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 处理订单取消逻辑
    ElMessage.success('订单已取消')
  }).catch(() => {})
}

function canTrack(row) {
  return ['已接单', '配送中'].includes(row.status)
}

function canPrint(row) {
  return ['待处理', '已接单', '配送中'].includes(row.status)
}

function canCancel(row) {
  return ['待处理'].includes(row.status)
}

function handleSearch() {
  loading.value = true
  // 模拟API调用
  setTimeout(() => {
    loading.value = false
  }, 500)
}

function resetSearch() {
  searchForm.value = {
    orderId: '',
    status: '',
    dateRange: []
  }
  handleSearch()
}

function handleSizeChange(val) {
  pageSize.value = val
  handleSearch()
}

function handleCurrentChange(val) {
  currentPage.value = val
  handleSearch()
}
</script>

<style scoped>
.order-list {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.print-preview {
  padding: 20px;
}

.print-header {
  text-align: center;
  margin-bottom: 20px;
}

.barcode {
  text-align: center;
  margin: 10px 0;
  padding: 10px;
  background: #f5f7fa;
  font-family: monospace;
  font-size: 16px;
}
</style>