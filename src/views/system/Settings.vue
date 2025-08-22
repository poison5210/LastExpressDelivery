<template>
  <div class="settings">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>系统设置</span>
        </div>
      </template>
      
      <el-tabs v-model="activeTab">
        <!-- 基本设置 -->
        <el-tab-pane label="基本设置" name="basic">
          <el-form
            ref="basicForm"
            :model="basicSettings"
            label-width="120px">
            <el-form-item label="系统名称">
              <el-input v-model="basicSettings.systemName" />
            </el-form-item>
            <el-form-item label="系统Logo">
              <el-upload
                class="logo-uploader"
                :auto-upload="false"
                :show-file-list="false"
                accept="image/*"
                @change="handleLogoChange">
                <img v-if="basicSettings.logo" :src="basicSettings.logo" class="logo" />
                <el-icon v-else class="logo-uploader-icon"><Plus /></el-icon>
              </el-upload>
            </el-form-item>
            <el-form-item label="页面标题">
              <el-input v-model="basicSettings.pageTitle" />
            </el-form-item>
            <el-form-item label="版权信息">
              <el-input v-model="basicSettings.copyright" />
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 通知设置 -->
        <el-tab-pane label="通知设置" name="notification">
          <el-form
            ref="notificationForm"
            :model="notificationSettings"
            label-width="120px">
            <el-form-item label="系统通知">
              <el-switch v-model="notificationSettings.systemNotification" />
            </el-form-item>
            <el-form-item label="邮件通知">
              <el-switch v-model="notificationSettings.emailNotification" />
            </el-form-item>
            <el-form-item label="短信通知">
              <el-switch v-model="notificationSettings.smsNotification" />
            </el-form-item>
            <el-form-item label="通知时间">
              <el-time-picker
                v-model="notificationSettings.notificationTime"
                format="HH:mm"
                placeholder="选择时间" />
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 安全设置 -->
        <el-tab-pane label="安全设置" name="security">
          <el-form
            ref="securityForm"
            :model="securitySettings"
            label-width="120px">
            <el-form-item label="登录安全">
              <el-checkbox-group v-model="securitySettings.loginSecurity">
                <el-checkbox label="ip">登录IP限制</el-checkbox>
                <el-checkbox label="captcha">登录验证码</el-checkbox>
                <el-checkbox label="2fa">两步验证</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="密码策略">
              <el-checkbox-group v-model="securitySettings.passwordPolicy">
                <el-checkbox label="length">最小长度8位</el-checkbox>
                <el-checkbox label="complex">必须包含字母和数字</el-checkbox>
                <el-checkbox label="special">必须包含特殊字符</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="会话超时">
              <el-input-number
                v-model="securitySettings.sessionTimeout"
                :min="1"
                :max="1440"
                label="分钟" />
              <span class="ml-2">分钟</span>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 日志设置 -->
        <el-tab-pane label="日志设置" name="log">
          <el-form
            ref="logForm"
            :model="logSettings"
            label-width="120px">
            <el-form-item label="操作日志">
              <el-switch v-model="logSettings.operationLog" />
            </el-form-item>
            <el-form-item label="登录日志">
              <el-switch v-model="logSettings.loginLog" />
            </el-form-item>
            <el-form-item label="保存时间">
              <el-select v-model="logSettings.retention">
                <el-option label="7天" value="7" />
                <el-option label="30天" value="30" />
                <el-option label="90天" value="90" />
                <el-option label="180天" value="180" />
                <el-option label="365天" value="365" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      
      <div class="settings-footer">
        <el-button type="primary" @click="saveSettings" :loading="saving">
          保存设置
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const activeTab = ref('basic')
const saving = ref(false)

// 基本设置
const basicSettings = reactive({
  systemName: '智能快递管理系统',
  logo: '',
  pageTitle: '智能快递管理系统 - 管理后台',
  copyright: '© 2024 智能快递管理系统'
})

// 通知设置
const notificationSettings = reactive({
  systemNotification: true,
  emailNotification: true,
  smsNotification: false,
  notificationTime: new Date(2024, 1, 1, 9, 0)
})

// 安全设置
const securitySettings = reactive({
  loginSecurity: ['captcha'],
  passwordPolicy: ['length', 'complex'],
  sessionTimeout: 30
})

// 日志设置
const logSettings = reactive({
  operationLog: true,
  loginLog: true,
  retention: '30'
})

function handleLogoChange(file) {
  const isJPG = file.raw.type === 'image/jpeg'
  const isLt2M = file.raw.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('Logo只能是JPG格式!')
    return
  }
  if (!isLt2M) {
    ElMessage.error('Logo大小不能超过2MB!')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    basicSettings.logo = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

async function saveSettings() {
  saving.value = true
  // 模拟API调用
  setTimeout(() => {
    ElMessage.success('设置保存成功')
    saving.value = false
  }, 1000)
}
</script>

<style scoped>
.settings {
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.settings-footer {
  margin-top: 20px;
  text-align: center;
}

.logo-uploader {
  text-align: center;
}

.logo-uploader .logo {
  width: 200px;
  height: 60px;
  object-fit: contain;
}

.logo-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 200px;
  height: 60px;
  line-height: 60px;
  text-align: center;
  border: 1px dashed #d9d9d9;
}

.ml-2 {
  margin-left: 8px;
}
</style>