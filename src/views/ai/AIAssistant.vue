<template>
  <div class="ai-assistant">
    <el-row :gutter="20">
      <!-- AI 聊天助手 -->
      <el-col :span="16">
        <el-card class="chat-card">
          <template #header>
            <div class="card-header">
              <span>AI 智能助手</span>
              <el-tag type="success" v-if="aiOnline">在线</el-tag>
              <el-tag type="info" v-else>离线</el-tag>
            </div>
          </template>
          
          <div class="chat-container" ref="chatContainer">
            <div
              v-for="message in chatMessages"
              :key="message.id"
              :class="['message', message.type]">
              <div class="message-avatar">
                <el-avatar v-if="message.type === 'user'" :src="userAvatar" />
                <el-avatar v-else>
                  <el-icon><Cpu /></el-icon>
                </el-avatar>
              </div>
              <div class="message-content">
                <div class="message-header">
                  <span class="sender">{{ message.sender }}</span>
                  <span class="time">{{ message.time }}</span>
                </div>
                <div class="message-text" v-html="formatMessage(message.content)"></div>
                <div v-if="message.streaming" class="streaming-indicator">
                  <el-icon class="is-loading"><Loading /></el-icon>
                  <span>AI正在思考...</span>
                </div>
                <div class="message-actions" v-if="message.type === 'ai' && message.actions">
                  <el-button
                    v-for="action in message.actions"
                    :key="action.id"
                    size="small"
                    type="primary"
                    link
                    @click="executeAction(action)">
                    {{ action.label }}
                  </el-button>
                </div>
              </div>
            </div>
            
            <div v-if="aiTyping" class="typing-indicator">
              <div class="message-avatar">
                <el-avatar>
                  <el-icon><Cpu /></el-icon>
                </el-avatar>
              </div>
              <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
          
          <div class="chat-input">
            <el-input
              v-model="inputMessage"
              placeholder="输入您的问题..."
              @keyup.enter="sendMessage"
              :disabled="aiTyping"
              :loading="aiTyping">
              <template #prepend>
                <el-button @click="toggleVoiceInput" :type="voiceInputActive ? 'primary' : 'default'">
                  <el-icon><Microphone /></el-icon>
                </el-button>
              </template>
              <template #append>
                <el-button type="primary" @click="sendMessage" :loading="aiTyping" :disabled="!inputMessage.trim()">
                  发送
                </el-button>
              </template>
            </el-input>
            <div class="input-actions">
              <el-button size="small" @click="clearChat" type="danger" plain>
                清空对话
              </el-button>
              <el-button size="small" @click="chatStore.regenerateLastResponse" :loading="aiTyping" plain>
                重新生成
              </el-button>
            </div>
          </div>
          
          <div class="quick-actions">
            <el-button
              v-for="action in quickActions"
              :key="action.id"
              size="small"
              @click="sendQuickMessage(action.message)">
              {{ action.label }}
            </el-button>
          </div>
        </el-card>
      </el-col>
      
      <!-- AI 功能面板 -->
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>AI 功能</span>
          </template>
          
          <el-collapse v-model="activeFeatures">
            <!-- 智能路线优化 -->
            <el-collapse-item title="智能路线优化" name="route">
              <div class="feature-content">
                <el-form label-width="80px">
                  <el-form-item label="起点">
                    <el-input v-model="routeForm.start" placeholder="输入起点地址" />
                  </el-form-item>
                  <el-form-item label="终点">
                    <el-input v-model="routeForm.end" placeholder="输入终点地址" />
                  </el-form-item>
                  <el-form-item label="优化目标">
                    <el-select v-model="routeForm.objective">
                      <el-option label="最短时间" value="time" />
                      <el-option label="最短距离" value="distance" />
                      <el-option label="最低成本" value="cost" />
                    </el-select>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="optimizeRoute" :loading="optimizing">
                      开始优化
                    </el-button>
                  </el-form-item>
                </el-form>
                
                <div v-if="routeResult" class="route-result">
                  <h4>优化结果</h4>
                  <el-descriptions :column="1" size="small">
                    <el-descriptions-item label="预计时间">{{ routeResult.time }}</el-descriptions-item>
                    <el-descriptions-item label="总距离">{{ routeResult.distance }}</el-descriptions-item>
                    <el-descriptions-item label="预计成本">{{ routeResult.cost }}</el-descriptions-item>
                    <el-descriptions-item label="节省">{{ routeResult.savings }}</el-descriptions-item>
                  </el-descriptions>
                </div>
              </div>
            </el-collapse-item>
            
            <!-- 智能客服 -->
            <el-collapse-item title="智能客服" name="service">
              <div class="feature-content">
                <el-form label-width="80px">
                  <el-form-item label="客户问题">
                    <el-input
                      v-model="serviceForm.question"
                      type="textarea"
                      :rows="3"
                      placeholder="输入客户问题" />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="generateResponse" :loading="generating">
                      生成回复
                    </el-button>
                  </el-form-item>
                </el-form>
                
                <div v-if="serviceResponse" class="service-response">
                  <h4>建议回复</h4>
                  <div class="response-content">{{ serviceResponse }}</div>
                  <el-button-group class="response-actions">
                    <el-button size="small" @click="copyResponse">复制</el-button>
                    <el-button size="small" type="primary" @click="useResponse">使用</el-button>
                  </el-button-group>
                </div>
              </div>
            </el-collapse-item>
            
            <!-- 预测分析 -->
            <el-collapse-item title="预测分析" name="prediction">
              <div class="feature-content">
                <el-form label-width="80px">
                  <el-form-item label="预测类型">
                    <el-select v-model="predictionForm.type">
                      <el-option label="订单量预测" value="orders" />
                      <el-option label="收入预测" value="revenue" />
                      <el-option label="成本预测" value="cost" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="预测周期">
                    <el-select v-model="predictionForm.period">
                      <el-option label="未来7天" value="7d" />
                      <el-option label="未来30天" value="30d" />
                      <el-option label="未来90天" value="90d" />
                    </el-select>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="runPrediction" :loading="predicting">
                      开始预测
                    </el-button>
                  </el-form-item>
                </el-form>
                
                <div v-if="predictionResult" class="prediction-result">
                  <h4>预测结果</h4>
                  <div ref="predictionChart" style="height: 200px;"></div>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </el-card>
        
        <!-- AI 学习进度 -->
        <el-card class="mt-4">
          <template #header>
            <span>AI 学习进度</span>
          </template>
          <div class="learning-progress">
            <div class="progress-item">
              <div class="progress-label">数据处理能力</div>
              <el-progress :percentage="85" status="success" />
            </div>
            <div class="progress-item">
              <div class="progress-label">预测准确率</div>
              <el-progress :percentage="92" status="success" />
            </div>
            <div class="progress-item">
              <div class="progress-label">响应速度</div>
              <el-progress :percentage="78" />
            </div>
            <div class="progress-item">
              <div class="progress-label">学习效率</div>
              <el-progress :percentage="95" status="success" />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, computed } from 'vue'
import { Cpu, Microphone } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { useChatStore } from '../../stores/chat'

const chatStore = useChatStore()

const aiOnline = ref(true)
const voiceInputActive = ref(false)
const inputMessage = ref('')
const chatContainer = ref(null)
const predictionChart = ref(null)
const activeFeatures = ref(['route'])
const optimizing = ref(false)
const generating = ref(false)
const predicting = ref(false)

const userAvatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'

// 使用 store 中的数据
const chatMessages = computed(() => chatStore.messages)
const aiTyping = computed(() => chatStore.isTyping)

// 初始化欢迎消息
onMounted(() => {
  if (chatMessages.value.length === 0) {
    chatStore.addMessage({
      type: 'ai',
      sender: 'AI助手',
      content: '您好！我是小智，您的AI智能助手。我可以帮助您进行快递管理、数据分析、业务咨询等工作。有什么可以帮助您的吗？',
      actions: [
        { id: 1, label: '查看今日数据', action: 'viewTodayData' },
        { id: 2, label: '分析配送效率', action: 'analyzeEfficiency' },
        { id: 3, label: '优化建议', action: 'getOptimization' }
      ]
    })
  }
})

const quickActions = [
  { id: 1, label: '今日数据概览', message: '请帮我分析今日的业务数据概览' },
  { id: 2, label: '异常订单检查', message: '帮我检查是否有异常订单需要处理' },
  { id: 3, label: '效率分析', message: '分析当前的配送效率，给出改进建议' },
  { id: 4, label: '成本优化', message: '分析运营成本，提供优化建议' },
  { id: 5, label: '客户满意度', message: '分析客户满意度情况' },
  { id: 6, label: '业务预测', message: '基于历史数据预测未来业务趋势' }
]

const routeForm = reactive({
  start: '',
  end: '',
  objective: 'time'
})

const routeResult = ref(null)

const serviceForm = reactive({
  question: ''
})

const serviceResponse = ref('')

const predictionForm = reactive({
  type: 'orders',
  period: '7d'
})

const predictionResult = ref(null)

async function sendMessage() {
  if (!inputMessage.value.trim()) return
  
  const message = inputMessage.value.trim()
  inputMessage.value = ''
  
  // 发送给真实AI
  await chatStore.sendToAI(message, true) // 使用流式响应
  
  scrollToBottom()
}

function sendQuickMessage(message) {
  chatStore.sendToAI(message, true)
}

function formatMessage(content) {
  return content.replace(/\n/g, '<br>')
}

function executeAction(action) {
  ElMessage.success(`执行操作: ${action.label}`)
  
  // 根据不同操作执行相应逻辑
  switch(action.action) {
    case 'viewTodayData':
      chatStore.sendToAI('请详细分析今日的业务数据，包括订单量、配送情况、收入等关键指标')
      break
    case 'analyzeEfficiency':
      chatStore.sendToAI('请分析当前的配送效率，找出可以改进的地方')
      break
    case 'getOptimization':
      chatStore.sendToAI('基于当前业务情况，给出具体的优化建议')
      break
    default:
      chatStore.sendToAI(`请帮我处理：${action.label}`)
  }
}

function toggleVoiceInput() {
  voiceInputActive.value = !voiceInputActive.value
  if (voiceInputActive.value) {
    ElMessage.info('语音输入已开启')
    // 这里可以集成语音识别API
  } else {
    ElMessage.info('语音输入已关闭')
  }
}

// 清空对话
function clearChat() {
  chatStore.clearMessages()
}

function optimizeRoute() {
  if (!routeForm.start || !routeForm.end) {
    ElMessage.warning('请输入起点和终点')
    return
  }
  
  optimizing.value = true
  setTimeout(() => {
    routeResult.value = {
      time: '45分钟',
      distance: '23.5公里',
      cost: '¥35.8',
      savings: '节省15分钟，¥8.2'
    }
    optimizing.value = false
    ElMessage.success('路线优化完成')
  }, 2000)
}

function generateResponse() {
  if (!serviceForm.question) {
    ElMessage.warning('请输入客户问题')
    return
  }
  
  generating.value = true
  setTimeout(() => {
    serviceResponse.value = `感谢您的咨询。针对您提到的问题，我们的处理方案如下：

1. 我们会立即安排专人跟进您的订单状态
2. 如有延迟，我们将第一时间与您联系说明情况
3. 我们承诺在24小时内给您满意的解决方案

如有其他问题，请随时联系我们的客服热线：400-123-4567。再次为给您带来的不便表示歉意。`
    
    generating.value = false
    ElMessage.success('回复生成完成')
  }, 1500)
}

function copyResponse() {
  navigator.clipboard.writeText(serviceResponse.value)
  ElMessage.success('回复已复制到剪贴板')
}

function useResponse() {
  ElMessage.success('回复已应用到客服系统')
}

function runPrediction() {
  predicting.value = true
  setTimeout(() => {
    predictionResult.value = {
      type: predictionForm.type,
      period: predictionForm.period,
      data: Array.from({length: 7}, (_, i) => Math.floor(Math.random() * 100) + 50)
    }
    
    nextTick(() => {
      initPredictionChart()
    })
    
    predicting.value = false
    ElMessage.success('预测分析完成')
  }, 2000)
}

function initPredictionChart() {
  const chart = echarts.init(predictionChart.value)
  const option = {
    title: {
      text: '预测趋势',
      textStyle: {
        fontSize: 14
      }
    },
    xAxis: {
      type: 'category',
      data: ['Day1', 'Day2', 'Day3', 'Day4', 'Day5', 'Day6', 'Day7']
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: predictionResult.value.data,
      type: 'line',
      smooth: true,
      itemStyle: {
        color: '#409EFF'
      }
    }]
  }
  chart.setOption(option)
}

function scrollToBottom() {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

// 监听消息变化，自动滚动到底部
watch(() => chatMessages.value.length, () => {
  scrollToBottom()
}, { flush: 'post' })

// 监听AI输入状态变化，自动滚动
watch(() => aiTyping.value, () => {
  if (aiTyping.value) {
    scrollToBottom()
  }
}, { flush: 'post' })
</script>

<style scoped>
.ai-assistant {
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.chat-card {
  height: 600px;
  display: flex;
  flex-direction: column;
}

.chat-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
}

.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f5f7fa;
}

.message {
  display: flex;
  margin-bottom: 20px;
  align-items: flex-start;
}

.message.user {
  flex-direction: row-reverse;
}

.message.user .message-content {
  background: #409EFF;
  color: white;
  margin-right: 10px;
}

.message-avatar {
  flex-shrink: 0;
}

.message-content {
  max-width: 70%;
  background: white;
  border-radius: 10px;
  padding: 12px 16px;
  margin-left: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
  opacity: 0.7;
}

.message-text {
  line-height: 1.6;
  margin-bottom: 8px;
}

.message-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.typing-indicator {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.typing-dots {
  display: flex;
  gap: 4px;
  margin-left: 10px;
  padding: 12px 16px;
  background: white;
  border-radius: 10px;
}

.typing-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #409EFF;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.chat-input {
  padding: 20px;
  border-top: 1px solid #ebeef5;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.streaming-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #409EFF;
  font-size: 12px;
  margin-top: 8px;
}

.quick-actions {
  padding: 0 20px 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.feature-content {
  padding: 10px 0;
}

.route-result,
.service-response,
.prediction-result {
  margin-top: 15px;
  padding: 15px;
  background: #f0f9ff;
  border-radius: 8px;
  border-left: 3px solid #409EFF;
}

.response-content {
  margin: 10px 0;
  line-height: 1.6;
  white-space: pre-line;
}

.response-actions {
  margin-top: 10px;
}

.learning-progress {
  space-y: 15px;
}

.progress-item {
  margin-bottom: 15px;
}

.progress-label {
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.mt-4 {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>