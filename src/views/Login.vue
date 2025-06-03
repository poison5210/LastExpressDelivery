<template>
  <div class="login-container">
    <div class="login-content">
      <div class="login-image">
        <img src="https://img.freepik.com/free-vector/delivery-service-illustrated_23-2148505081.jpg?w=1380&t=st=1708440436~exp=1708441036~hmac=6f0bad8287d7a7a9984aa8e76d789151444d60e14c3f7573337e87d988d669d5" alt="Logistics" />
      </div>
      <div class="login-form-container">
        <div class="login-header">
          <h1>SmartLogi</h1>
          <p>{{ isLogin ? '欢迎回来' : '创建新账号' }}</p>
        </div>
        
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          class="login-form">
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              :placeholder="isLogin ? '用户名' : '请设置用户名'"
              :prefix-icon="User">
            </el-input>
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              :placeholder="isLogin ? '密码' : '请设置密码'"
              :prefix-icon="Lock"
              show-password>
            </el-input>
          </el-form-item>

          <template v-if="!isLogin">
            <el-form-item prop="confirmPassword">
              <el-input
                v-model="form.confirmPassword"
                type="password"
                placeholder="请确认密码"
                :prefix-icon="Lock"
                show-password>
              </el-input>
            </el-form-item>

            <el-form-item prop="email">
              <el-input
                v-model="form.email"
                placeholder="请输入邮箱"
                :prefix-icon="Message">
              </el-input>
            </el-form-item>

            <el-form-item prop="phone">
              <el-input
                v-model="form.phone"
                placeholder="请输入手机号"
                :prefix-icon="Phone">
              </el-input>
            </el-form-item>
          </template>
          
          <div class="form-options" v-if="isLogin">
            <el-checkbox v-model="form.remember">记住我</el-checkbox>
            <el-button type="text" @click="handleForgotPassword">忘记密码？</el-button>
          </div>
          
          <el-button
            type="primary"
            class="submit-button"
            :loading="loading"
            @click="handleSubmit">
            {{ isLogin ? '登录' : '注册' }}
          </el-button>
          
          <div class="switch-form">
            <p>
              {{ isLogin ? '还没有账号？' : '已有账号？' }}
              <el-button type="text" @click="toggleForm">
                {{ isLogin ? '立即注册' : '立即登录' }}
              </el-button>
            </p>
          </div>

          <div class="demo-accounts" v-if="isLogin">
            <p>演示账号：</p>
            <div class="demo-buttons">
              <el-button type="text" @click="fillDemoAccount('admin')">管理员账号</el-button>
              <el-button type="text" @click="fillDemoAccount('courier')">快递员账号</el-button>
            </div>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Message, Phone } from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)
const isLogin = ref(true)

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  phone: '',
  remember: false
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== form.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

function fillDemoAccount(type) {
  form.username = type
  form.password = '123456'
}

function toggleForm() {
  isLogin.value = !isLogin.value
  formRef.value?.resetFields()
}

async function handleSubmit() {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    if (isLogin.value) {
      await userStore.login(form)
      ElMessage.success('登录成功')
      router.push('/dashboard')
    } else {
      // 模拟注册API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      ElMessage.success('注册成功，请登录')
      isLogin.value = true
      formRef.value.resetFields()
    }
  } catch (error) {
    ElMessage.error(error.message || (isLogin.value ? '登录失败' : '注册失败'))
  } finally {
    loading.value = false
  }
}

function handleForgotPassword() {
  ElMessage.info('请联系系统管理员重置密码')
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #000;
  padding: 20px;
}

.login-content {
  display: flex;
  width: 100%;
  max-width: 1200px;
  background: #1a1a1a;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.login-image {
  flex: 1;
  background: #2a2a2a;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.login-image img {
  width: 100%;
  height: auto;
  object-fit: contain;
}

.login-form-container {
  flex: 1;
  padding: 60px;
  background: #1a1a1a;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-header h1 {
  font-size: 36px;
  color: #fff;
  margin: 0 0 10px;
}

.login-header p {
  color: #888;
  margin: 0;
  font-size: 16px;
}

.login-form {
  max-width: 400px;
  margin: 0 auto;
}

.login-form :deep(.el-input__wrapper) {
  background-color: #2a2a2a;
  border: none;
  box-shadow: none;
}

.login-form :deep(.el-input__inner) {
  color: #fff;
  height: 45px;
}

.login-form :deep(.el-input__prefix-inner) {
  color: #888;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
}

.form-options :deep(.el-checkbox__label) {
  color: #888;
}

.submit-button {
  width: 100%;
  height: 45px;
  font-size: 16px;
  background: #409EFF;
  border: none;
  margin-bottom: 20px;
}

.switch-form {
  text-align: center;
  color: #888;
}

.switch-form .el-button {
  color: #409EFF;
  font-weight: bold;
}

.demo-accounts {
  margin-top: 30px;
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #2a2a2a;
}

.demo-accounts p {
  color: #888;
  margin-bottom: 10px;
}

.demo-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.demo-buttons .el-button {
  color: #409EFF;
}

@media (max-width: 992px) {
  .login-image {
    display: none;
  }
  
  .login-form-container {
    padding: 40px 20px;
  }
}
</style>