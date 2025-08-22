<template>
  <div class="blockchain-track">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>区块链溯源追踪</span>
          <el-tag type="success">区块链保护</el-tag>
        </div>
      </template>
      
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="订单号">
          <el-input
            v-model="searchForm.orderId"
            placeholder="请输入订单号"
            clearable>
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="区块哈希">
          <el-input
            v-model="searchForm.blockHash"
            placeholder="请输入区块哈希"
            clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchBlockchain" :loading="searching">
            <el-icon><Search /></el-icon> 查询
          </el-button>
        </el-form-item>
      </el-form>
      
      <div v-if="blockchainData" class="blockchain-info">
        <!-- 区块链概览 -->
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="info-card">
              <div class="info-icon">
                <el-icon><Lock /></el-icon>
              </div>
              <div class="info-content">
                <div class="info-value">{{ blockchainData.blockHeight }}</div>
                <div class="info-label">区块高度</div>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-card">
              <div class="info-icon">
                <el-icon><Timer /></el-icon>
              </div>
              <div class="info-content">
                <div class="info-value">{{ blockchainData.confirmations }}</div>
                <div class="info-label">确认数</div>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-card">
              <div class="info-icon">
                <el-icon><Lock /></el-icon>
              </div>
              <div class="info-content">
                <div class="info-value">{{ blockchainData.security }}</div>
                <div class="info-label">安全等级</div>
              </div>
            </div>
          </el-col>
        </el-row>
        
        <!-- 区块链详情 -->
        <el-card class="mt-4">
          <template #header>
            <span>区块链详细信息</span>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="区块哈希">
              <el-text class="hash-text" copyable>{{ blockchainData.blockHash }}</el-text>
            </el-descriptions-item>
            <el-descriptions-item label="前一区块哈希">
              <el-text class="hash-text" copyable>{{ blockchainData.prevHash }}</el-text>
            </el-descriptions-item>
            <el-descriptions-item label="时间戳">{{ blockchainData.timestamp }}</el-descriptions-item>
            <el-descriptions-item label="矿工地址">{{ blockchainData.miner }}</el-descriptions-item>
            <el-descriptions-item label="交易数量">{{ blockchainData.txCount }}</el-descriptions-item>
            <el-descriptions-item label="区块大小">{{ blockchainData.size }}</el-descriptions-item>
            <el-descriptions-item label="难度值">{{ blockchainData.difficulty }}</el-descriptions-item>
            <el-descriptions-item label="Nonce">{{ blockchainData.nonce }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
        
        <!-- 交易记录 -->
        <el-card class="mt-4">
          <template #header>
            <div class="card-header">
              <span>交易记录链</span>
              <el-button type="primary" size="small" @click="verifyIntegrity" :loading="verifying">
                <el-icon><CircleCheck /></el-icon> 验证完整性
              </el-button>
            </div>
          </template>
          
          <div class="transaction-chain">
            <div
              v-for="(tx, index) in blockchainData.transactions"
              :key="tx.hash"
              class="transaction-block"
              :class="{ verified: tx.verified }">
              <div class="block-header">
                <div class="block-number">{{ index + 1 }}</div>
                <div class="block-status">
                  <el-tag :type="tx.verified ? 'success' : 'warning'">
                    {{ tx.verified ? '已验证' : '待验证' }}
                  </el-tag>
                </div>
              </div>
              
              <div class="block-content">
                <div class="tx-hash">
                  <strong>交易哈希:</strong>
                  <el-text class="hash-text" copyable>{{ tx.hash }}</el-text>
                </div>
                <div class="tx-details">
                  <el-descriptions :column="1" size="small">
                    <el-descriptions-item label="操作类型">{{ tx.type }}</el-descriptions-item>
                    <el-descriptions-item label="操作时间">{{ tx.timestamp }}</el-descriptions-item>
                    <el-descriptions-item label="操作人">{{ tx.operator }}</el-descriptions-item>
                    <el-descriptions-item label="操作内容">{{ tx.content }}</el-descriptions-item>
                    <el-descriptions-item label="位置信息">{{ tx.location }}</el-descriptions-item>
                  </el-descriptions>
                </div>
                
                <div class="digital-signature">
                  <strong>数字签名:</strong>
                  <div class="signature-box">{{ tx.signature }}</div>
                </div>
              </div>
              
              <div class="block-connection" v-if="index < blockchainData.transactions.length - 1">
                <div class="connection-line"></div>
                <div class="connection-hash">{{ tx.nextHash }}</div>
              </div>
            </div>
          </div>
        </el-card>
        
        <!-- 智能合约 -->
        <el-card class="mt-4">
          <template #header>
            <span>智能合约执行记录</span>
          </template>
          <el-table :data="blockchainData.contracts" style="width: 100%">
            <el-table-column prop="address" label="合约地址" width="200">
              <template #default="{ row }">
                <el-text class="hash-text" copyable>{{ row.address }}</el-text>
              </template>
            </el-table-column>
            <el-table-column prop="function" label="执行函数" />
            <el-table-column prop="params" label="参数" show-overflow-tooltip />
            <el-table-column prop="result" label="执行结果">
              <template #default="{ row }">
                <el-tag :type="row.result === 'success' ? 'success' : 'danger'">
                  {{ row.result === 'success' ? '成功' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="gasUsed" label="Gas消耗" />
            <el-table-column prop="timestamp" label="执行时间" />
          </el-table>
        </el-card>
        
        <!-- 完整性验证结果 -->
        <el-card class="mt-4" v-if="verificationResult">
          <template #header>
            <div class="card-header">
              <span>完整性验证结果</span>
              <el-tag :type="verificationResult.status === 'valid' ? 'success' : 'danger'">
                {{ verificationResult.status === 'valid' ? '验证通过' : '验证失败' }}
              </el-tag>
            </div>
          </template>
          
          <div class="verification-details">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="验证状态">
                <el-tag :type="verificationResult.status === 'valid' ? 'success' : 'danger'">
                  {{ verificationResult.status === 'valid' ? '通过' : '失败' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="验证时间">{{ verificationResult.timestamp }}</el-descriptions-item>
              <el-descriptions-item label="哈希校验">
                <el-tag :type="verificationResult.hashValid ? 'success' : 'danger'">
                  {{ verificationResult.hashValid ? '通过' : '失败' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="签名验证">
                <el-tag :type="verificationResult.signatureValid ? 'success' : 'danger'">
                  {{ verificationResult.signatureValid ? '通过' : '失败' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="时间戳验证">
                <el-tag :type="verificationResult.timestampValid ? 'success' : 'danger'">
                  {{ verificationResult.timestampValid ? '通过' : '失败' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="链式验证">
                <el-tag :type="verificationResult.chainValid ? 'success' : 'danger'">
                  {{ verificationResult.chainValid ? '通过' : '失败' }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
            
            <div class="verification-summary">
              <h4>验证摘要</h4>
              <p>{{ verificationResult.summary }}</p>
            </div>
          </div>
        </el-card>
      </div>
      
      <div v-else-if="searched" class="no-result">
        <el-empty description="未找到相关区块链记录" />
      </div>
      
      <div v-else class="search-hint">
        <el-empty description="请输入订单号或区块哈希进行查询">
          <template #image>
            <el-icon :size="60"><Search /></el-icon>
          </template>
        </el-empty>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Search, Lock, Timer, CircleCheck } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const searching = ref(false)
const verifying = ref(false)
const searched = ref(false)
const blockchainData = ref(null)
const verificationResult = ref(null)

const searchForm = reactive({
  orderId: '',
  blockHash: ''
})

// 模拟区块链数据
const mockBlockchainData = {
  blockHeight: 1234567,
  confirmations: 6,
  security: '极高',
  blockHash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890',
  prevHash: '0x0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba',
  timestamp: '2024-02-20 10:00:00',
  miner: '0xabcdef1234567890abcdef1234567890abcdef12',
  txCount: 5,
  size: '2.3 KB',
  difficulty: '15.78T',
  nonce: 2847563921,
  transactions: [
    {
      hash: '0xa1b2c3d4e5f6789012345678901234567890123456789012345678901234567890',
      type: '订单创建',
      timestamp: '2024-02-20 10:00:00',
      operator: '系统',
      content: '创建订单 ORD20240001',
      location: '北京市朝阳区',
      signature: '0x304502210098765432109876543210987654321098765432109876543210987654321098765432102201009876543210987654321098765432109876543210987654321098765432109876543210',
      verified: true,
      nextHash: '0xb2c3d4e5f6789012345678901234567890123456789012345678901234567890a1'
    },
    {
      hash: '0xb2c3d4e5f6789012345678901234567890123456789012345678901234567890a1',
      type: '订单接收',
      timestamp: '2024-02-20 10:30:00',
      operator: '张三',
      content: '快递员接收订单',
      location: '北京市朝阳区配送中心',
      signature: '0x304502210087654321098765432109876543210987654321098765432109876543210987654321022010087654321098765432109876543210987654321098765432109876543210987654321',
      verified: true,
      nextHash: '0xc3d4e5f6789012345678901234567890123456789012345678901234567890a1b2'
    },
    {
      hash: '0xc3d4e5f6789012345678901234567890123456789012345678901234567890a1b2',
      type: '开始配送',
      timestamp: '2024-02-20 11:00:00',
      operator: '张三',
      content: '开始配送，预计2小时送达',
      location: '北京市朝阳区某某街道',
      signature: '0x304502210076543210987654321098765432109876543210987654321098765432109876543210220100765432109876543210987654321098765432109876543210987654321098765432',
      verified: true,
      nextHash: '0xd4e5f6789012345678901234567890123456789012345678901234567890a1b2c3'
    },
    {
      hash: '0xd4e5f6789012345678901234567890123456789012345678901234567890a1b2c3',
      type: '配送中',
      timestamp: '2024-02-20 12:00:00',
      operator: '张三',
      content: '包裹配送中，距离目的地5公里',
      location: '北京市朝阳区某某路口',
      signature: '0x304502210065432109876543210987654321098765432109876543210987654321098765432102201006543210987654321098765432109876543210987654321098765432109876543',
      verified: true,
      nextHash: '0xe5f6789012345678901234567890123456789012345678901234567890a1b2c3d4'
    },
    {
      hash: '0xe5f6789012345678901234567890123456789012345678901234567890a1b2c3d4',
      type: '配送完成',
      timestamp: '2024-02-20 13:00:00',
      operator: '张三',
      content: '包裹已送达，客户已签收',
      location: '北京市朝阳区目的地',
      signature: '0x304502210054321098765432109876543210987654321098765432109876543210987654321022010054321098765432109876543210987654321098765432109876543210987654',
      verified: true
    }
  ],
  contracts: [
    {
      address: '0x1234567890abcdef1234567890abcdef12345678',
      function: 'createOrder',
      params: 'orderId: ORD20240001, amount: 100',
      result: 'success',
      gasUsed: '21000',
      timestamp: '2024-02-20 10:00:00'
    },
    {
      address: '0x1234567890abcdef1234567890abcdef12345678',
      function: 'updateStatus',
      params: 'orderId: ORD20240001, status: delivering',
      result: 'success',
      gasUsed: '15000',
      timestamp: '2024-02-20 11:00:00'
    },
    {
      address: '0x1234567890abcdef1234567890abcdef12345678',
      function: 'completeOrder',
      params: 'orderId: ORD20240001, signature: customer_signature',
      result: 'success',
      gasUsed: '18000',
      timestamp: '2024-02-20 13:00:00'
    }
  ]
}

function searchBlockchain() {
  if (!searchForm.orderId && !searchForm.blockHash) {
    ElMessage.warning('请输入订单号或区块哈希')
    return
  }
  
  searching.value = true
  searched.value = true
  
  // 模拟API调用
  setTimeout(() => {
    blockchainData.value = mockBlockchainData
    searching.value = false
    ElMessage.success('区块链数据查询成功')
  }, 1500)
}

function verifyIntegrity() {
  verifying.value = true
  
  // 模拟完整性验证
  setTimeout(() => {
    verificationResult.value = {
      status: 'valid',
      timestamp: new Date().toLocaleString(),
      hashValid: true,
      signatureValid: true,
      timestampValid: true,
      chainValid: true,
      summary: '所有区块链记录完整性验证通过。哈希链完整，数字签名有效，时间戳连续，未发现任何篡改痕迹。'
    }
    verifying.value = false
    ElMessage.success('完整性验证完成')
  }, 2000)
}
</script>

<style scoped>
.blockchain-track {
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
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
  border-radius: 8px;
}

.blockchain-info {
  margin-top: 20px;
}

.info-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  color: white;
}

.info-icon {
  font-size: 32px;
  margin-right: 15px;
  opacity: 0.8;
}

.info-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.info-label {
  font-size: 14px;
  opacity: 0.9;
}

.hash-text {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  word-break: break-all;
}

.transaction-chain {
  position: relative;
}

.transaction-block {
  border: 2px solid #e4e7ed;
  border-radius: 10px;
  margin-bottom: 20px;
  background: white;
  transition: all 0.3s;
  position: relative;
}

.transaction-block.verified {
  border-color: #67c23a;
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.2);
}

.block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
  border-radius: 8px 8px 0 0;
}

.block-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #409eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.block-content {
  padding: 20px;
}

.tx-hash {
  margin-bottom: 15px;
  padding: 10px;
  background: #f0f9ff;
  border-radius: 6px;
  border-left: 3px solid #409eff;
}

.tx-details {
  margin: 15px 0;
}

.digital-signature {
  margin-top: 15px;
}

.signature-box {
  margin-top: 8px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  word-break: break-all;
  border: 1px solid #ddd;
}

.block-connection {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}

.connection-line {
  width: 2px;
  height: 20px;
  background: #409eff;
  margin: 0 auto 5px;
}

.connection-hash {
  font-size: 10px;
  color: #909399;
  font-family: 'Courier New', monospace;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.verification-details {
  padding: 20px 0;
}

.verification-summary {
  margin-top: 20px;
  padding: 15px;
  background: #f0f9ff;
  border-radius: 8px;
  border-left: 3px solid #409eff;
}

.verification-summary h4 {
  margin: 0 0 10px;
  color: #409eff;
}

.verification-summary p {
  margin: 0;
  line-height: 1.6;
  color: #606266;
}

.mt-4 {
  margin-top: 20px;
}

.search-hint,
.no-result {
  margin: 40px 0;
  text-align: center;
}
</style>