<template>
  <div class="analytics">
    <el-row :gutter="20">
      <!-- 实时数据监控 -->
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>实时数据监控</span>
              <el-switch
                v-model="realTimeEnabled"
                active-text="实时更新"
                @change="toggleRealTime" />
            </div>
          </template>
          <el-row :gutter="20">
            <el-col :span="6" v-for="metric in realTimeMetrics" :key="metric.key">
              <div class="metric-card">
                <div class="metric-value" :class="metric.trend">
                  {{ metric.value }}
                  <el-icon class="trend-icon">
                    <ArrowUp v-if="metric.trend === 'up'" />
                    <ArrowDown v-if="metric.trend === 'down'" />
                  </el-icon>
                </div>
                <div class="metric-label">{{ metric.label }}</div>
                <div class="metric-change">{{ metric.change }}</div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-4">
      <!-- 高级图表分析 -->
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>多维度数据分析</span>
              <el-radio-group v-model="chartType" size="small">
                <el-radio-button label="trend">趋势分析</el-radio-button>
                <el-radio-button label="comparison">对比分析</el-radio-button>
                <el-radio-button label="prediction">预测分析</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="advancedChart" style="height: 400px;"></div>
        </el-card>
      </el-col>

      <!-- 地理热力图 -->
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>配送热力图</span>
          </template>
          <div ref="heatmapChart" style="height: 400px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-4">
      <!-- AI 智能分析 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>AI 智能分析</span>
              <el-button type="primary" size="small" @click="runAIAnalysis" :loading="aiAnalyzing">
                <el-icon><MagicStick /></el-icon> 运行分析
              </el-button>
            </div>
          </template>
          <div class="ai-insights">
            <div v-for="insight in aiInsights" :key="insight.id" class="insight-item">
              <div class="insight-header">
                <el-tag :type="insight.type">{{ insight.category }}</el-tag>
                <span class="insight-confidence">置信度: {{ insight.confidence }}%</span>
              </div>
              <div class="insight-content">{{ insight.content }}</div>
              <div class="insight-suggestion">
                <strong>建议:</strong> {{ insight.suggestion }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 异常检测 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>异常检测系统</span>
              <el-badge :value="anomalies.length" type="danger">
                <el-button size="small" @click="refreshAnomalies">
                  <el-icon><Warning /></el-icon> 检测异常
                </el-button>
              </el-badge>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="anomaly in anomalies"
              :key="anomaly.id"
              :type="anomaly.severity"
              :timestamp="anomaly.time">
              <h4>{{ anomaly.title }}</h4>
              <p>{{ anomaly.description }}</p>
              <el-button-group>
                <el-button size="small" type="primary" @click="handleAnomaly(anomaly, 'investigate')">
                  调查
                </el-button>
                <el-button size="small" type="success" @click="handleAnomaly(anomaly, 'resolve')">
                  解决
                </el-button>
                <el-button size="small" type="warning" @click="handleAnomaly(anomaly, 'ignore')">
                  忽略
                </el-button>
              </el-button-group>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>

    <!-- 自定义报表生成器 -->
    <el-row :gutter="20" class="mt-4">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>自定义报表生成器</span>
              <el-button type="primary" @click="showReportBuilder = true">
                <el-icon><Document /></el-icon> 创建报表
              </el-button>
            </div>
          </template>
          <el-table :data="customReports" style="width: 100%">
            <el-table-column prop="name" label="报表名称" />
            <el-table-column prop="type" label="类型" />
            <el-table-column prop="schedule" label="调度" />
            <el-table-column prop="lastRun" label="最后运行" />
            <el-table-column label="操作" width="200">
              <template #default="scope">
                <el-button size="small" @click="runReport(scope.row)">运行</el-button>
                <el-button size="small" type="primary" @click="editReport(scope.row)">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteReport(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 报表构建器对话框 -->
    <el-dialog
      v-model="showReportBuilder"
      title="报表构建器"
      width="800px"
      :close-on-click-modal="false">
      <el-form :model="reportForm" label-width="100px">
        <el-form-item label="报表名称">
          <el-input v-model="reportForm.name" />
        </el-form-item>
        <el-form-item label="数据源">
          <el-select v-model="reportForm.dataSource" multiple>
            <el-option label="订单数据" value="orders" />
            <el-option label="用户数据" value="users" />
            <el-option label="物流数据" value="logistics" />
            <el-option label="财务数据" value="finance" />
          </el-select>
        </el-form-item>
        <el-form-item label="图表类型">
          <el-radio-group v-model="reportForm.chartType">
            <el-radio label="line">折线图</el-radio>
            <el-radio label="bar">柱状图</el-radio>
            <el-radio label="pie">饼图</el-radio>
            <el-radio label="scatter">散点图</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="reportForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期" />
        </el-form-item>
        <el-form-item label="调度设置">
          <el-select v-model="reportForm.schedule">
            <el-option label="手动运行" value="manual" />
            <el-option label="每日" value="daily" />
            <el-option label="每周" value="weekly" />
            <el-option label="每月" value="monthly" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showReportBuilder = false">取消</el-button>
        <el-button type="primary" @click="saveReport">保存报表</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { ArrowUp, ArrowDown, MagicStick, Warning, Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const realTimeEnabled = ref(false)
const chartType = ref('trend')
const aiAnalyzing = ref(false)
const showReportBuilder = ref(false)
const advancedChart = ref(null)
const heatmapChart = ref(null)
let advancedChartInstance = null
let heatmapChartInstance = null
let realTimeTimer = null

// 实时监控数据
const realTimeMetrics = ref([
  {
    key: 'orders',
    label: '实时订单',
    value: '1,234',
    change: '+12.5%',
    trend: 'up'
  },
  {
    key: 'delivery',
    label: '配送中',
    value: '156',
    change: '+8.3%',
    trend: 'up'
  },
  {
    key: 'completed',
    label: '已完成',
    value: '86',
    change: '-2.1%',
    trend: 'down'
  },
  {
    key: 'revenue',
    label: '实时收入',
    value: '¥12,345',
    change: '+15.7%',
    trend: 'up'
  }
])

// AI 分析结果
const aiInsights = ref([
  {
    id: 1,
    category: '效率优化',
    type: 'success',
    confidence: 92,
    content: '检测到朝阳区配送效率较低，平均配送时间比其他区域高出25%',
    suggestion: '建议增加该区域配送人员或优化配送路线'
  },
  {
    id: 2,
    category: '成本控制',
    type: 'warning',
    confidence: 87,
    content: '燃油成本在过去一周上涨了8%，影响整体运营成本',
    suggestion: '考虑调整配送策略或与客户协商运费调整'
  },
  {
    id: 3,
    category: '需求预测',
    type: 'info',
    confidence: 95,
    content: '预测下周订单量将增长15%，主要集中在电商包裹',
    suggestion: '提前安排人力资源，确保服务质量'
  }
])

// 异常检测数据
const anomalies = ref([
  {
    id: 1,
    title: '配送延迟异常',
    description: '检测到5个订单配送时间超过预期2小时以上',
    time: '5分钟前',
    severity: 'danger'
  },
  {
    id: 2,
    title: '路线偏离',
    description: '快递员张三的配送路线偏离最优路径30%',
    time: '10分钟前',
    severity: 'warning'
  },
  {
    id: 3,
    title: '客户投诉激增',
    description: '过去1小时内收到3起客户投诉，需要关注',
    time: '15分钟前',
    severity: 'info'
  }
])

// 自定义报表
const customReports = ref([
  {
    id: 1,
    name: '月度配送效率报表',
    type: '效率分析',
    schedule: '每月',
    lastRun: '2024-02-20 09:00'
  },
  {
    id: 2,
    name: '客户满意度分析',
    type: '客户分析',
    schedule: '每周',
    lastRun: '2024-02-19 15:30'
  }
])

const reportForm = ref({
  name: '',
  dataSource: [],
  chartType: 'line',
  dateRange: [],
  schedule: 'manual'
})

onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  disposeCharts()
  if (realTimeTimer) {
    clearInterval(realTimeTimer)
  }
})

function initCharts() {
  // 初始化高级图表
  advancedChartInstance = echarts.init(advancedChart.value)
  updateAdvancedChart()

  // 初始化热力图
  heatmapChartInstance = echarts.init(heatmapChart.value)
  initHeatmap()
}

function updateAdvancedChart() {
  const option = {
    title: {
      text: '多维度趋势分析',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['订单量', '配送效率', '客户满意度', '成本指数'],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
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
        name: '效率/满意度(%)',
        position: 'right'
      }
    ],
    series: [
      {
        name: '订单量',
        type: 'bar',
        data: [120, 132, 101, 134, 90, 230, 210],
        itemStyle: {
          color: '#409EFF'
        }
      },
      {
        name: '配送效率',
        type: 'line',
        yAxisIndex: 1,
        data: [85, 88, 82, 90, 87, 92, 89],
        smooth: true,
        itemStyle: {
          color: '#67C23A'
        }
      },
      {
        name: '客户满意度',
        type: 'line',
        yAxisIndex: 1,
        data: [92, 94, 89, 95, 91, 96, 93],
        smooth: true,
        itemStyle: {
          color: '#E6A23C'
        }
      },
      {
        name: '成本指数',
        type: 'line',
        yAxisIndex: 1,
        data: [78, 82, 85, 80, 83, 79, 81],
        smooth: true,
        itemStyle: {
          color: '#F56C6C'
        }
      }
    ]
  }
  advancedChartInstance.setOption(option)
}

function initHeatmap() {
  const data = []
  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 7; j++) {
      data.push([j, i, Math.floor(Math.random() * 100)])
    }
  }

  const option = {
    title: {
      text: '配送热力图',
      left: 'center'
    },
    tooltip: {
      position: 'top'
    },
    grid: {
      height: '50%',
      top: '10%'
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      splitArea: {
        show: true
      }
    },
    yAxis: {
      type: 'category',
      data: Array.from({length: 24}, (_, i) => i + ':00'),
      splitArea: {
        show: true
      }
    },
    visualMap: {
      min: 0,
      max: 100,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '15%'
    },
    series: [{
      name: '配送密度',
      type: 'heatmap',
      data: data,
      label: {
        show: false
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  }
  heatmapChartInstance.setOption(option)
}

function toggleRealTime(enabled) {
  if (enabled) {
    realTimeTimer = setInterval(() => {
      updateRealTimeData()
    }, 3000)
    ElMessage.success('实时监控已开启')
  } else {
    if (realTimeTimer) {
      clearInterval(realTimeTimer)
      realTimeTimer = null
    }
    ElMessage.info('实时监控已关闭')
  }
}

function updateRealTimeData() {
  realTimeMetrics.value.forEach(metric => {
    const change = (Math.random() - 0.5) * 10
    const newValue = parseInt(metric.value.replace(/[^\d]/g, '')) + Math.floor(change)
    
    if (metric.key === 'revenue') {
      metric.value = `¥${newValue.toLocaleString()}`
    } else {
      metric.value = newValue.toLocaleString()
    }
    
    metric.change = `${change > 0 ? '+' : ''}${change.toFixed(1)}%`
    metric.trend = change > 0 ? 'up' : 'down'
  })
}

function runAIAnalysis() {
  aiAnalyzing.value = true
  setTimeout(() => {
    aiAnalyzing.value = false
    ElMessage.success('AI分析完成')
    // 可以添加新的分析结果
  }, 3000)
}

function refreshAnomalies() {
  ElMessage.info('正在检测异常...')
  setTimeout(() => {
    ElMessage.success('异常检测完成')
  }, 1000)
}

function handleAnomaly(anomaly, action) {
  const actions = {
    investigate: '调查',
    resolve: '解决',
    ignore: '忽略'
  }
  ElMessage.success(`已${actions[action]}异常: ${anomaly.title}`)
  
  if (action === 'resolve' || action === 'ignore') {
    const index = anomalies.value.findIndex(a => a.id === anomaly.id)
    if (index > -1) {
      anomalies.value.splice(index, 1)
    }
  }
}

function runReport(report) {
  ElMessage.info(`正在运行报表: ${report.name}`)
  setTimeout(() => {
    report.lastRun = new Date().toLocaleString()
    ElMessage.success('报表运行完成')
  }, 2000)
}

function editReport(report) {
  reportForm.value = { ...report }
  showReportBuilder.value = true
}

function deleteReport(report) {
  const index = customReports.value.findIndex(r => r.id === report.id)
  if (index > -1) {
    customReports.value.splice(index, 1)
    ElMessage.success('报表已删除')
  }
}

function saveReport() {
  if (!reportForm.value.name) {
    ElMessage.warning('请输入报表名称')
    return
  }
  
  const newReport = {
    id: Date.now(),
    ...reportForm.value,
    type: '自定义',
    lastRun: '未运行'
  }
  
  customReports.value.push(newReport)
  showReportBuilder.value = false
  reportForm.value = {
    name: '',
    dataSource: [],
    chartType: 'line',
    dateRange: [],
    schedule: 'manual'
  }
  ElMessage.success('报表已保存')
}

function handleResize() {
  advancedChartInstance?.resize()
  heatmapChartInstance?.resize()
}

function disposeCharts() {
  advancedChartInstance?.dispose()
  heatmapChartInstance?.dispose()
}
</script>

<style scoped>
.analytics {
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mt-4 {
  margin-top: 20px;
}

.metric-card {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  color: white;
  position: relative;
  overflow: hidden;
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(-100%);
  transition: transform 0.6s;
}

.metric-card:hover::before {
  transform: translateX(100%);
}

.metric-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.metric-value.up {
  color: #67C23A;
}

.metric-value.down {
  color: #F56C6C;
}

.trend-icon {
  font-size: 16px;
}

.metric-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 4px;
}

.metric-change {
  font-size: 12px;
  opacity: 0.8;
}

.ai-insights {
  max-height: 400px;
  overflow-y: auto;
}

.insight-item {
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  margin-bottom: 15px;
  background: #fafafa;
}

.insight-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.insight-confidence {
  font-size: 12px;
  color: #909399;
}

.insight-content {
  margin-bottom: 10px;
  line-height: 1.6;
}

.insight-suggestion {
  font-size: 14px;
  color: #606266;
  background: #f0f9ff;
  padding: 8px;
  border-radius: 4px;
  border-left: 3px solid #409EFF;
}
</style>