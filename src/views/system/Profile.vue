<template>
  <div class="profile">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>个人信息</span>
              <el-button type="primary" link @click="handleEdit">
                编辑资料
              </el-button>
            </div>
          </template>
          <div class="profile-info">
            <div class="avatar-container">
              <el-avatar :size="100" :src="userStore.currentUser.avatar" />
              <h3>{{ userStore.currentUser.name }}</h3>
              <p>{{ userStore.currentUser.role }}</p>
            </div>
            <el-descriptions direction="vertical" :column="1" border>
              <el-descriptions-item label="用户名">{{ userStore.currentUser.username }}</el-descriptions-item>
              <el-descriptions-item label="邮箱">{{ userStore.currentUser.email }}</el-descriptions-item>
              <el-descriptions-item label="手机">{{ userStore.currentUser.phone }}</el-descriptions-item>
              <el-descriptions-item label="部门">{{ userStore.currentUser.department }}</el-descriptions-item>
              <el-descriptions-item label="加入时间">{{ userStore.currentUser.joinTime }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>安全设置</span>
            </div>
          </template>
          <el-form label-width="100px">
            <el-form-item label="账号安全">
              <div class="security-item">
                <div>
                  <h4>登录密码</h4>
                  <p class="text-muted">建议定期更改密码，设置安全性高的密码</p>
                </div>
                <el-button link @click="handleChangePassword">修改</el-button>
              </div>
            </el-form-item>
            <el-form-item label="手机绑定">
              <div class="security-item">
                <div>
                  <h4>{{ userStore.currentUser.phone }}</h4>
                  <p class="text-muted">已绑定手机号，可用于登录和找回密码</p>
                </div>
                <el-button link @click="handleChangePhone">修改</el-button>
              </div>
            </el-form-item>
            <el-form-item label="邮箱绑定">
              <div class="security-item">
                <div>
                  <h4>{{ userStore.currentUser.email }}</h4>
                  <p class="text-muted">已绑定邮箱，可用于接收通知</p>
                </div>
                <el-button link @click="handleChangeEmail">修改</el-button>
              </div>
            </el-form-item>
          </el-form>
        </el-card>
        
        <el-card class="mt-4">
          <template #header>
            <div class="card-header">
              <span>最近登录记录</span>
            </div>
          </template>
          <el-table :data="loginRecords" style="width: 100%">
            <el-table-column prop="time" label="登录时间" width="180" />
            <el-table-column prop="ip" label="IP地址" width="180" />
            <el-table-column prop="location" label="登录地点" />
            <el-table-column prop="device" label="设备信息" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 'success' ? 'success' : 'danger'">
                  {{ row.status === 'success' ? '成功' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="passwordDialogVisible"
      title="修改密码"
      width="400px">
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px">
        <el-form-item label="当前密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="passwordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitPasswordChange" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑资料对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑个人资料"
      width="500px">
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-width="100px">
        <el-form-item label="头像">
          <el-upload
            class="avatar-uploader"
            :auto-upload="false"
            :show-file-list="false"
            accept="image/*"
            @change="handleAvatarChange">
            <img v-if="editForm.avatar" :src="editForm.avatar" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editForm.phone" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEdit" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 修改手机号对话框 -->
    <el-dialog
      v-model="phoneDialogVisible"
      title="修改手机号"
      width="400px">
      <el-form
        ref="phoneFormRef"
        :model="phoneForm"
        :rules="phoneRules"
        label-width="100px">
        <el-form-item label="新手机号" prop="phone">
          <el-input v-model="phoneForm.phone" />
        </el-form-item>
        <el-form-item label="验证码" prop="code">
          <div class="verification-code">
            <el-input v-model="phoneForm.code" />
            <el-button 
              type="primary" 
              :disabled="countdown > 0"
              @click="sendPhoneCode">
              {{ countdown > 0 ? `${countdown}秒后重试` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="phoneDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitPhoneChange" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 修改邮箱对话框 -->
    <el-dialog
      v-model="emailDialogVisible"
      title="修改邮箱"
      width="400px">
      <el-form
        ref="emailFormRef"
        :model="emailForm"
        :rules="emailRules"
        label-width="100px">
        <el-form-item label="新邮箱" prop="email">
          <el-input v-model="emailForm.email" />
        </el-form-item>
        <el-form-item label="验证码" prop="code">
          <div class="verification-code">
            <el-input v-model="emailForm.code" />
            <el-button 
              type="primary" 
              :disabled="emailCountdown > 0"
              @click="sendEmailCode">
              {{ emailCountdown > 0 ? `${emailCountdown}秒后重试` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="emailDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEmailChange" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useUserStore } from '../../stores/user'

const userStore = useUserStore()

const loginRecords = ref([
  {
    time: '2024-02-20 10:00:00',
    ip: '192.168.1.1',
    location: '北京市',
    device: 'Chrome 120.0.0 / Windows 10',
    status: 'success'
  },
  {
    time: '2024-02-19 15:30:00',
    ip: '192.168.1.2',
    location: '上海市',
    device: 'Safari / macOS',
    status: 'success'
  }
])

// 修改密码
const passwordDialogVisible = ref(false)
const submitting = ref(false)
const passwordFormRef = ref(null)
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 编辑资料
const editDialogVisible = ref(false)
const editFormRef = ref(null)
const editForm = reactive({
  avatar: userStore.currentUser.avatar,
  name: userStore.currentUser.name,
  phone: userStore.currentUser.phone,
  email: userStore.currentUser.email
})

const editRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 修改手机号
const phoneDialogVisible = ref(false)
const phoneFormRef = ref(null)
const phoneForm = reactive({
  phone: '',
  code: ''
})
const countdown = ref(0)

const phoneRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码长度应为6位', trigger: 'blur' }
  ]
}

// 修改邮箱
const emailDialogVisible = ref(false)
const emailFormRef = ref(null)
const emailForm = reactive({
  email: '',
  code: ''
})
const emailCountdown = ref(0)

const emailRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码长度应为6位', trigger: 'blur' }
  ]
}

function handleEdit() {
  editDialogVisible.value = true
  Object.assign(editForm, {
    avatar: userStore.currentUser.avatar,
    name: userStore.currentUser.name,
    phone: userStore.currentUser.phone,
    email: userStore.currentUser.email
  })
}

function handleChangePassword() {
  passwordDialogVisible.value = true
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
}

function handleChangePhone() {
  phoneDialogVisible.value = true
  phoneForm.phone = ''
  phoneForm.code = ''
}

function handleChangeEmail() {
  emailDialogVisible.value = true
  emailForm.email = ''
  emailForm.code = ''
}

function handleAvatarChange(file) {
  const isImage = file.raw.type.startsWith('image/')
  const isLt2M = file.raw.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    editForm.avatar = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

function startCountdown(type = 'phone') {
  const target = type === 'phone' ? countdown : emailCountdown
  target.value = 60
  const timer = setInterval(() => {
    target.value--
    if (target.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

function sendPhoneCode() {
  if (!phoneForm.phone) {
    ElMessage.warning('请先输入手机号')
    return
  }
  startCountdown('phone')
  ElMessage.success('验证码已发送')
}

function sendEmailCode() {
  if (!emailForm.email) {
    ElMessage.warning('请先输入邮箱')
    return
  }
  startCountdown('email')
  ElMessage.success('验证码已发送')
}

async function submitPasswordChange() {
  if (!passwordFormRef.value) return
  
  await passwordFormRef.value.validate((valid) => {
    if (valid) {
      submitting.value = true
      setTimeout(() => {
        ElMessage.success('密码修改成功')
        passwordDialogVisible.value = false
        submitting.value = false
        passwordForm.oldPassword = ''
        passwordForm.newPassword = ''
        passwordForm.confirmPassword = ''
      }, 1000)
    }
  })
}

async function submitEdit() {
  if (!editFormRef.value) return
  
  await editFormRef.value.validate((valid) => {
    if (valid) {
      submitting.value = true
      setTimeout(() => {
        userStore.updateUser({
          name: editForm.name,
          phone: editForm.phone,
          email: editForm.email,
          avatar: editForm.avatar
        })
        ElMessage.success('资料更新成功')
        editDialogVisible.value = false
        submitting.value = false
      }, 1000)
    }
  })
}

async function submitPhoneChange() {
  if (!phoneFormRef.value) return
  
  await phoneFormRef.value.validate((valid) => {
    if (valid) {
      submitting.value = true
      setTimeout(() => {
        userStore.updateUser({ phone: phoneForm.phone })
        ElMessage.success('手机号修改成功')
        phoneDialogVisible.value = false
        submitting.value = false
        phoneForm.phone = ''
        phoneForm.code = ''
      }, 1000)
    }
  })
}

async function submitEmailChange() {
  if (!emailFormRef.value) return
  
  await emailFormRef.value.validate((valid) => {
    if (valid) {
      submitting.value = true
      setTimeout(() => {
        userStore.updateUser({ email: emailForm.email })
        ElMessage.success('邮箱修改成功')
        emailDialogVisible.value = false
        submitting.value = false
        emailForm.email = ''
        emailForm.code = ''
      }, 1000)
    }
  })
}
</script>

<style scoped>
.profile {
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-info {
  text-align: center;
}

.avatar-container {
  margin-bottom: 20px;
}

.avatar-container h3 {
  margin: 10px 0 5px;
}

.avatar-container p {
  margin: 0;
  color: #909399;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.security-item h4 {
  margin: 0 0 5px;
}

.text-muted {
  color: #909399;
  margin: 0;
  font-size: 13px;
}

.mt-4 {
  margin-top: 20px;
}

.avatar-uploader {
  text-align: center;
  cursor: pointer;
}

.avatar-uploader .avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 50%;
}

.verification-code {
  display: flex;
  gap: 10px;
}

.verification-code .el-input {
  flex: 1;
}

.verification-code .el-button {
  width: 120px;
}
</style>