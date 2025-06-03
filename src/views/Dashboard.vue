<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6" v-for="card in statsCards" :key="card.title">
        <el-card class="stats-card" :body-style="{ padding: '20px' }">
          <template #header>
            <div class="card-header">
              <span>{{ card.title }}</span>
              <el-tag :type="card.type">{{ card.change }}</el-tag>
            </div>
          </template>
          <div class="card-value">{{ card.value }}</div>
          <div class="card-chart">
            <div ref="chartRefs" :id="'chart-' + card.id" style="height: 50px;"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-4">
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>订单统计</span>
              <el-radio-group v-model="chartTimeRange" size="small">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
                <el-radio-button label="year">全年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="mainChart" style="height: 350px;"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>配送区域分布</span>
            </div>
          </template>
          <div ref="pieChart" style="height: 350px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-4">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>待处理订单</span>
              <el-button type="primary" link @click="handleMoreOrders">
                查看更多 <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
          </template>
          <el-table :data="pendingOrders" style="width: 100%">
            <el-table-column prop="id" label="订单号" width="120" />
            <el-table-column prop="customer" label="客户" width="120" />
            <el-table-column prop="address" label="配送地址" show-overflow-tooltip />
            <el-table-column prop="createTime" label="创建时间" width="180" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>系统通知</span>
              <el-button type="primary" link>全部标记已读</el-button>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="(activity, index) in recentActivities"
              :key="index"
              :type="activity.type"
              :timestamp="activity.time"
              :hollow="activity.hollow">
              <h4>{{ activity.title }}</h4>
              <p>{{ activity.content }}</p>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { ArrowRight } from '@element-plus/icons-vue'

const router = useRouter()
const chartTimeRange = ref('week')
const mainChart = ref(null)
const pieChart = ref(null)
let mainChartInstance = null
let pieChartInstance = null

const statsCards = ref([
  {
    id: 'orders',
    title: '总订单数',
    value: '1,234',
    change: '+12%',
    type: 'success',
    data: [30, 40, 35, 50, 49, 60, 70, 91, 125]
  },
  {
    id: 'delivery',
    title: '在途配送',
    value: '156',
    change: '+8%',
    type: 'warning',
    data: [20, 25, 28, 32, 36, 42, 45, 48, 52]
  },
  {
    id: 'completed',
    title: '今日完成',
    value: '86',
    change: '+15%',
    type: 'success',
    data: [10, 12, 15, 18, 22, 26, 32, 38, 45]
  },
  {
    id: 'revenue',
    title: '营业额',
    value: '¥12,345',
    change: '+10%',
    type: 'success',
    data: [5000, 5500, 6000, 7000, 8000, 9000, 10000, 11000, 12345]
  }
])

const pendingOrders = ref([
  {
    id: 'ORD20240001',
    customer: '张三',
    address: '北京市朝阳区某某街道1号',
    createTime: '2024-02-20 10:00:00'
  },
  {
    id: 'ORD20240002',
    customer: '李四',
    address: '上海市浦东新区某某路2号',
    createTime: '2024-02-20 10:30:00'
  },
  {
    id: 'ORD20240003',
    customer: '王五',
    address: '广州市天河区某某大道3号',
    createTime: '2024-02-20 11:00:00'
  }
])

const recentActivities = ref([
  {
    title: '系统更新',
    content: '系统已更新至最新版本 v2.0.1',
    time: '10分钟前',
    type: 'primary',
    hollow: true
  },
  {
    title: '新订单提醒',
    content: '收到新的快递订单 #ORD20240001',
    time: '30分钟前',
    type: 'success',
    hollow: false
  },
  {
    title: '异常警告',
    content: '检测到3个配送延迟订单，请及时处理',
    time: '1小时前',
    type: 'warning',
    hollow: false
  }
])

onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  disposeCharts()
})

const handleResize = () => {
  mainChartInstance?.resize()
  pieChartInstance?.resize()
}

const initCharts = () => {
  // 初始化主图表
  mainChartInstance = echarts.init(mainChart.value)
  const mainOption = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['订单量', '完成量', '收入']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: [
      {
        type: 'value',
        name: '订单量',
        position: 'left'
      },
      {
        type: 'value',
        name: '收入(元)',
        position: 'right'
      }
    ],
    series: [
      {
        name: '订单量',
        type: 'line',
        smooth: true,
        data: [120, 132, 101, 134, 90, 230, 210]
      },
      {
        name: '完成量',
        type: 'line',
        smooth: true,
        data: [110, 122, 91, 124, 85, 220, 200]
      },
      {
        name: '收入',
        type: 'bar',
        yAxisIndex: 1,
        data: [2000, 2200, 1800, 2400, 1900, 2800, 2600]
      }
    ]
  }
  mainChartInstance.setOption(mainOption)

  // 初始化饼图
  pieChartInstance = echarts.init(pieChart.value)
  const pieOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 10,
      data: ['朝阳区', '海淀区', '东城区', '西城区', '其他']
    },
    series: [
      {
        name: '配送区域',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 335, name: '朝阳区' },
          { value: 310, name: '海淀区' },
          { value: 234, name: '东城区' },
          { value: 135, name: '西城区' },
          { value: 148, name: '其他' }
        ]
      }
    ]
  }
  pieChartInstance.setOption(pieOption)
}

const disposeCharts = () => {
  mainChartInstance?.dispose()
  pieChartInstance?.dispose()
}

const handleMoreOrders = () => {
  router.push('/orders')
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.stats-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin: 10px 0;
}

.card-chart {
  margin-top: 10px;
}

.mt-4 {
  margin-top: 20px;
}

:deep(.el-timeline-item__node--hollow) {
  background-color: #fff;
}
</style>