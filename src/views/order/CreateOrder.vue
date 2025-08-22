<template>
  <div class="create-order">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>创建新订单</span>
        </div>
      </template>
      
      <el-steps :active="activeStep" finish-status="success" class="mb-4">
        <el-step title="填写信息" />
        <el-step title="确认订单" />
        <el-step title="支付" />
      </el-steps>
      
      <!-- 步骤1：填写信息 -->
      <div v-if="activeStep === 0">
        <el-form
          ref="orderForm"
          :model="form"
          :rules="rules"
          label-width="120px"
          class="order-form">
          <el-divider content-position="left">寄件人信息</el-divider>
          
          <el-form-item label="寄件人姓名" prop="senderName">
            <el-input v-model="form.senderName" />
          </el-form-item>
          <el-form-item label="寄件人电话" prop="senderPhone">
            <el-input v-model="form.senderPhone" />
          </el-form-item>
          <el-form-item label="寄件人地址" prop="senderAddress">
            <el-cascader
              v-model="form.senderRegion"
              :options="regions"
              placeholder="请选择省/市/区"
              class="mb-2"
              style="width: 100%;" />
            <el-input
              v-model="form.senderAddress"
              type="textarea"
              placeholder="请输入详细地址" />
          </el-form-item>
          
          <el-divider content-position="left">收件人信息</el-divider>
          
          <el-form-item label="收件人姓名" prop="receiverName">
            <el-input v-model="form.receiverName" />
          </el-form-item>
          <el-form-item label="收件人电话" prop="receiverPhone">
            <el-input v-model="form.receiverPhone" />
          </el-form-item>
          <el-form-item label="收件人地址" prop="receiverAddress">
            <el-cascader
              v-model="form.receiverRegion"
              :options="regions"
              placeholder="请选择省/市/区"
              class="mb-2"
              style="width: 100%;" />
            <el-input
              v-model="form.receiverAddress"
              type="textarea"
              placeholder="请输入详细地址" />
          </el-form-item>
          
          <el-divider content-position="left">包裹信息</el-divider>
          
          <el-form-item label="物品类型" prop="itemType">
            <el-select v-model="form.itemType" placeholder="请选择物品类型" style="width: 100%;">
              <el-option label="文件" value="document" />
              <el-option label="服装" value="clothing" />
              <el-option label="电子产品" value="electronics" />
              <el-option label="食品" value="food" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="包裹重量" prop="weight">
            <el-input-number
              v-model="form.weight"
              :min="0.1"
              :max="100"
              :step="0.1"
              :precision="1"
              style="width: 100%;" />
          </el-form-item>
          
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="form.remark"
              type="textarea"
              placeholder="请输入备注信息（选填）" />
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 步骤2：确认订单 -->
      <div v-if="activeStep === 1">
        <el-descriptions title="订单信息" :column="2" border>
          <el-descriptions-item label="寄件人">{{ form.senderName }}</el-descriptions-item>
          <el-descriptions-item label="寄件人电话">{{ form.senderPhone }}</el-descriptions-item>
          <el-descriptions-item label="寄件地址" :span="2">
            {{ getFullAddress(form.senderRegion, form.senderAddress) }}
          </el-descriptions-item>
          
          <el-descriptions-item label="收件人">{{ form.receiverName }}</el-descriptions-item>
          <el-descriptions-item label="收件人电话">{{ form.receiverPhone }}</el-descriptions-item>
          <el-descriptions-item label="收件地址" :span="2">
            {{ getFullAddress(form.receiverRegion, form.receiverAddress) }}
          </el-descriptions-item>
          
          <el-descriptions-item label="物品类型">{{ getItemTypeName(form.itemType) }}</el-descriptions-item>
          <el-descriptions-item label="包裹重量">{{ form.weight }}kg</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ form.remark || '无' }}</el-descriptions-item>
        </el-descriptions>
        
        
        
        <el-divider />
        
        <div class="fee-details">
          <h3>费用明细</h3>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="基础运费">¥{{ basePrice }}</el-descriptions-item>
            <el-descriptions-item label="重量附加费">¥{{ weightFee }}</el-descriptions-item>
            <el-descriptions-item label="总计">
              <span class="total-fee">¥{{ totalFee }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
      
      <!-- 步骤3：支付 -->
      <div v-if="activeStep === 2">
        <div class="payment-container">
          <h3>请选择支付方式</h3>
          <div class="payment-methods">
            <el-radio-group v-model="paymentMethod" class="payment-radio-group">
              <el-radio label="alipay">
                <img src="https://img.alicdn.com/imgextra/i4/O1CN01XCiY5B1nx2GJDzXKD_!!6000000005147-2-tps-200-200.png" class="payment-icon" />
                支付宝
              </el-radio>
              <el-radio label="wechat">
                <img src="https://res.wx.qq.com/a/wx_fed/assets/res/OTE0YTAw.png" class="payment-icon" />
                微信支付
              </el-radio>
            </el-radio-group>
          </div>
          
          <div class="payment-amount">
            <span class="amount-label">支付金额：</span>
            <span class="amount-value">¥{{ totalFee }}</span>
          </div>
          
          <div class="payment-qrcode" v-if="showQRCode">
            <img :src="qrCodeUrl" alt="支付二维码" class="qrcode-image" />
            <p class="qrcode-tip">请使用{{ paymentMethod === 'alipay' ? '支付宝' : '微信' }}扫码支付</p>
          </div>
        </div>
      </div>
      
      <div class="form-actions">
        <el-button @click="prevStep" v-if="activeStep > 0">上一步</el-button>
        <el-button
          type="primary"
          @click="nextStep"
          :loading="loading"
          v-if="activeStep < 2">
          下一步
        </el-button>
        <el-button
          type="primary"
          @click="handlePayment"
          :loading="loading"
          v-else>
          确认支付
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const orderForm = ref(null)
const activeStep = ref(0)
const loading = ref(false)
const paymentMethod = ref('alipay')
const showQRCode = ref(false)
const qrCodeUrl = ref('')

const form = ref({
  senderName: '',
  senderPhone: '',
  senderRegion: [],
  senderAddress: '',
  receiverName: '',
  receiverPhone: '',
  receiverRegion: [],
  receiverAddress: '',
  itemType: '',
  weight: 1,
  remark: ''
})

const rules = {
  senderName: [
    { required: true, message: '请输入寄件人姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  senderPhone: [
    { required: true, message: '请输入寄件人电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  senderAddress: [
    { required: true, message: '请输入寄件人详细地址', trigger: 'blur' }
  ],
  receiverName: [
    { required: true, message: '请输入收件人姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  receiverPhone: [
    { required: true, message: '请输入收件人电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  receiverAddress: [
    { required: true, message: '请输入收件人详细地址', trigger: 'blur' }
  ],
  itemType: [
    { required: true, message: '请选择物品类型', trigger: 'change' }
  ],
  weight: [
    { required: true, message: '请输入包裹重量', trigger: 'blur' }
  ]
}

// 模拟地区数据
const regions = [
  {
    value: 'beijing',
    label: '北京市',
    children: [
      {
        value: 'beijing',
        label: '北京市',
        children: [
          { value: 'chaoyang', label: '朝阳区' },
          { value: 'haidian', label: '海淀区' }
        ]
      }
    ]
  },
  {
    value: 'shanghai',
    label: '上海市',
    children: [
      {
        value: 'shanghai',
        label: '上海市',
        children: [
          { value: 'pudong', label: '浦东新区' },
          { value: 'xuhui', label: '徐汇区' }
        ]
      }
    ]
  }
]

const basePrice = computed(() => 20) // 基础运费
const weightFee = computed(() => Math.max(0, (form.value.weight - 1) * 10)) // 超重费用
const totalFee = computed(() => basePrice.value + weightFee.value)

function getItemTypeName(type) {
  const types = {
    document: '文件',
    clothing: '服装',
    electronics: '电子产品',
    food: '食品',
    other: '其他'
  }
  return types[type] || type
}

function getFullAddress(region, detail) {
  if (!region || region.length === 0) return detail || ''
  return region.map(r => r).join(' ') + ' ' + (detail || '')
}

async function nextStep() {
  if (activeStep.value === 0) {
    await orderForm.value.validate((valid) => {
      if (valid) {
        activeStep.value++
      }
    })
  } else if (activeStep.value === 1) {
    activeStep.value++
  }
}

function prevStep() {
  activeStep.value--
}

function handlePayment() {
  loading.value = true
  // 模拟支付过程
  showQRCode.value = true
  qrCodeUrl.value = paymentMethod.value === 'alipay'
    ? 'https://img.alicdn.com/imgextra/i4/O1CN01XCiY5B1nx2GJDzXKD_!!6000000005147-2-tps-200-200.png'
    : 'https://res.wx.qq.com/a/wx_fed/assets/res/OTE0YTAw.png'
  
  // 模拟支付完成
  setTimeout(() => {
    loading.value = false
    ElMessage.success('支付成功！')
    router.push('/orders')
  }, 2000)
}
</script>

<style scoped>
.create-order {
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mb-4 {
  margin-bottom: 20px;
}

.mb-2 {
  margin-bottom: 8px;
}

.order-form {
  margin-top: 20px;
}

.form-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.fee-details {
  margin-top: 20px;
}

.total-fee {
  color: #f56c6c;
  font-size: 20px;
  font-weight: bold;
}

.payment-container {
  text-align: center;
  padding: 20px;
}

.payment-methods {
  margin: 30px 0;
}

.payment-radio-group {
  display: flex;
  justify-content: center;
  gap: 40px;
}

.payment-icon {
  width: 32px;
  height: 32px;
  margin-right: 8px;
  vertical-align: middle;
}

.payment-amount {
  margin: 20px 0;
  font-size: 18px;
}

.amount-label {
  color: #606266;
}

.amount-value {
  color: #f56c6c;
  font-size: 24px;
  font-weight: bold;
}

.payment-qrcode {
  margin-top: 30px;
}

.qrcode-image {
  width: 200px;
  height: 200px;
}

.qrcode-tip {
  margin-top: 10px;
  color: #909399;
}
</style>