<template>
  <div class="exception">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>异常管理</span>
          <el-button type="primary" @click="handleAdd">添加异常记录</el-button>
        </div>
      </template>
      
      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="订单号">
          <el-input v-model="searchForm.orderId" placeholder="请输入订单号" clearable />
        </el-form-item>
        <el-form-item label="异常类型">
          <el-select v-model="searchForm.type" placeholder="请选择异常类型" clearable>
            <el-option
              v-for="type in exceptionTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="处理状态">
          <el-select v-model="searchForm.status" placeholder="请选择处理状态" clearable>
            <el-option label="待处理" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="已处理" value="resolved" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 异常列表 -->
      <el-table
        v-loading="loading"
        :data="exceptions"
        style="width: 100%"
        border
        stripe>
        <el-table-column prop="id" label="异常ID" width="100" />
        <el-table-column prop="orderId" label="订单号" width="150" />
        <el-table-column prop="type" label="异常类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getExceptionType(row.type)">
              {{ getExceptionLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="异常描述" show-overflow-tooltip />
        <el-table-column prop="status" label="处理状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="handler" label="处理人" width="120" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button
              size="small"
              @click="handleProcess(scope.row)"
              :disabled="scope.row.status === 'resolved'">
              处理
            </el-button>
            <el-button
              size="small"
              type="primary"
              @click="handleDetail(scope.row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 异常处理对话框 -->
    <el-dialog
      v-model="processDialogVisible"
      title="异常处理"
      width="500px">
      <el-form
        ref="processForm"
        :model="processForm"
        :rules="processRules"
        label-width="100px">
        <el-form-item label="处理方案" prop="solution">
          <el-input
            v-model="processForm.solution"
            type="textarea"
            :rows="3"
            placeholder="请输入处理方案" />
        </el-form-item>
        <el-form-item label="处理结果" prop="result">
          <el-input
            v-model="processForm.result"
            type="textarea"
            :rows="3"
            placeholder="请输入处理结果" />
        </el-form-item>
        <el-form-item label="处理状态" prop="status">
          <el-select v-model="processForm.status" placeholder="请选择处理状态">
            <el-option label="处理中" value="processing" />
            <el-option label="已处理" value="resolved" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="processDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitProcess" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 异常详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="异常详情"
      width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="异常ID">{{ selectedException?.id }}</el-descriptions-item>
        <el-descriptions-item label="订单号">{{ selectedException?.orderId }}</el-descriptions-item>
        <el-descriptions-item label="异常类型">
          <el-tag :type="getExceptionType(selectedException?.type)">
            {{ getExceptionLabel(selectedException?.type) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="处理状态">
          <el-tag :type="getStatusType(selectedException?.status)">
            {{ getStatusLabel(selectedException?.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="异常描述" :span="2">
          {{ selectedException?.description }}
        </el-descriptions-item>
        <el-descriptions-item label="处理方案" :span="2">
          {{ selectedException?.solution || '暂无' }}
        </el-descriptions-item>
        <el-descriptions-item label="处理结果" :span="2">
          {{ selectedException?.result || '暂无' }}
        </el-descriptions-item>
        <el-descriptions-item label="处理人">{{ selectedException?.handler }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ selectedException?.createTime }}</el-descriptions-item>
      </el-descriptions>
      
      <div class="process-timeline" v-if="selectedException?.timeline?.length">
        <h4>处理记录</h4>
        <el-timeline>
          <el-timeline-item
            v-for="(record, index) in selectedException.timeline"
            :key="index"
            :type="record.type"
            :timestamp="record.time">
            <h4>{{ record.title }}</h4>
            <p>{{ record.content }}</p>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

// 异常类型
const exceptionTypes = [
  { value: 'damaged', label: '包裹损坏' },
  { value: 'lost', label: '包裹丢失' },
  { value: 'delay', label: '配送延迟' },
  {value: 'wrong_address', label: '地址错误' },
  { value: 'other', label: '其他' }
]

// 搜索表单
const searchForm = reactive({
  orderId: '',
  type: '',
  status: '',
  dateRange: []
})

// 表格数据
const loading = ref(false)
const exceptions = ref([
  {
    id: 'EX001',
    orderId: 'ORD20240001',
    type: 'damaged',
    description: '包裹在运输过程中受损',
    status: 'pending',
    handler: '-',
    createTime: '2024-02-20 10:00:00',
    solution: '',
    result: '',
    timeline: []
  },
  {
    id: 'EX002',
    orderId: 'ORD20240002',
    type: 'delay',
    description: '由于天气原因，配送延迟',
    status: 'processing',
    handler: '张三',
    createTime: '2024-02-20 09:00:00',
    solution: '安排加急配送',
    result: '正在处理中',
    timeline: [
      {
        time: '2024-02-20 09:00:00',
        title: '创建异常记录',
        content: '系统自动创建异常记录',
        type: 'info'
      },
      {
        time: '2024-02-20 09:30:00',
        title: '开始处理',
        content: '张三接手处理',
        type: 'primary'
      }
    ]
  }
])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 处理对话框
const processDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const submitting = ref(false)
const selectedException = ref(null)

const processForm = reactive({
  solution: '',
  result: '',
  status: ''
})

const processRules = {
  solution: [
    { required: true, message: '请输入处理方案', trigger: 'blur' }
  ],
  result: [
    { required: true, message: '请输入处理结果', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择处理状态', trigger: 'change' }
  ]
}

// 方法
function getExceptionType(type) {
  const types = {
    damaged: 'danger',
    lost: 'danger',
    delay: 'warning',
    wrong_address: 'warning',
    other: 'info'
  }
  return types[type] || 'info'
}

function getExceptionLabel(type) {
  const exception = exceptionTypes.find(t => t.value === type)
  return exception ? exception.label : type
}

function getStatusType(status) {
  const types = {
    pending: 'info',
    processing: 'warning',
    resolved: 'success'
  }
  return types[status] || 'info'
}

function getStatusLabel(status) {
  const labels = {
    pending: '待处理',
    processing: '处理中',
    resolved: '已处理'
  }
  return labels[status] || status
}

function handleSearch() {
  loading.value = true
  // 模拟API调用
  setTimeout(() => {
    loading.value = false
  }, 500)
}

function resetSearch() {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
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

function handleAdd() {
  // 实现添加异常记录逻辑
}

function handleProcess(row) {
  selectedException.value = row
  processForm.solution = row.solution
  processForm.result = row.result
  processForm.status = row.status
  processDialogVisible.value = true
}

function handleDetail(row) {
  selectedException.value = row
  detailDialogVisible.value = true
}

async function submitProcess() {
  submitting.value = true
  // 模拟API调用
  setTimeout(() => {
    const index = exceptions.value.findIndex(e => e.id === selectedException.value.id)
    if (index !== -1) {
      exceptions.value[index] = {
        ...exceptions.value[index],
        ...processForm,
        handler: '张三',
        timeline: [
          ...exceptions.value[index].timeline,
          {
            time: new Date().toLocaleString(),
            title: processForm.status === 'resolved' ? '完成处理' : '更新处理进度',
            content: processForm.result,
            type: processForm.status === 'resolved' ? 'success' : 'primary'
          }
        ]
      }
    }
    ElMessage.success('处理成功')
    processDialogVisible.value = false
    submitting.value = false
  }, 1000)
}
</script>

<style scoped>
.exception {
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

.process-timeline {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.process-timeline h4 {
  margin-bottom: 15px;
}
</style>