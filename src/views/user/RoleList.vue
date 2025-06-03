<template>
  <div class="role-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <el-button type="primary" @click="handleAdd">添加角色</el-button>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="roles"
        style="width: 100%"
        border
        stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="角色名称" width="150" />
        <el-table-column prop="code" label="角色标识" width="150" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button
              size="small"
              type="success"
              @click="handlePermission(scope.row)">
              权限设置
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(scope.row)"
              :disabled="scope.row.isSystem">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 角色表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加角色' : '编辑角色'"
      width="500px">
      <el-form
        ref="roleForm"
        :model="form"
        :rules="rules"
        label-width="100px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="角色标识" prop="code">
          <el-input v-model="form.code" :disabled="dialogType === 'edit'" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 权限设置对话框 -->
    <el-dialog
      v-model="permissionDialogVisible"
      title="权限设置"
      width="600px">
      <el-tree
        ref="permissionTree"
        :data="permissions"
        :props="{ label: 'name' }"
        show-checkbox
        node-key="id"
        :default-checked-keys="selectedPermissions">
        <template #default="{ node, data }">
          <span class="custom-tree-node">
            <span>{{ node.label }}</span>
            <span class="permission-code">{{ data.code }}</span>
          </span>
        </template>
      </el-tree>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="permissionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSavePermissions" :loading="savingPermissions">
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const dialogVisible = ref(false)
const dialogType = ref('add')
const submitting = ref(false)
const roleForm = ref(null)
const permissionDialogVisible = ref(false)
const savingPermissions = ref(false)
const selectedPermissions = ref([])
const permissionTree = ref(null)

// 角色列表数据
const roles = ref([
  {
    id: 1,
    name: '超级管理员',
    code: 'admin',
    description: '系统最高权限',
    createTime: '2024-02-20 10:00:00',
    isSystem: true
  },
  {
    id: 2,
    name: '快递员',
    code: 'courier',
    description: '负责快递配送',
    createTime: '2024-02-20 10:00:00',
    isSystem: true
  },
  {
    id: 3,
    name: '客服',
    code: 'customer_service',
    description: '处理客户问题',
    createTime: '2024-02-20 10:00:00',
    isSystem: false
  }
])

// 权限树数据
const permissions = ref([
  {
    id: 1,
    name: '系统管理',
    code: 'system',
    children: [
      {
        id: 11,
        name: '用户管理',
        code: 'system:user',
        children: [
          { id: 111, name: '查看用户', code: 'system:user:view' },
          { id: 112, name: '添加用户', code: 'system:user:add' },
          { id: 113, name: '编辑用户', code: 'system:user:edit' },
          { id: 114, name: '删除用户', code: 'system:user:delete' }
        ]
      },
      {
        id: 12,
        name: '角色管理',
        code: 'system:role',
        children: [
          { id: 121, name: '查看角色', code: 'system:role:view' },
          { id: 122, name: '添加角色', code: 'system:role:add' },
          { id: 123, name: '编辑角色', code: 'system:role:edit' },
          { id: 124, name: '删除角色', code: 'system:role:delete' }
        ]
      }
    ]
  },
  {
    id: 2,
    name: '订单管理',
    code: 'order',
    children: [
      { id: 21, name: '查看订单', code: 'order:view' },
      { id: 22, name: '创建订单', code: 'order:create' },
      { id: 23, name: '编辑订单', code: 'order:edit' },
      { id: 24, name: '删除订单', code: 'order:delete' }
    ]
  }
])

const form = reactive({
  name: '',
  code: '',
  description: ''
})

const rules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入角色标识', trigger: 'blur' },
    { pattern: /^[a-z_]+$/, message: '只能包含小写字母和下划线', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入角色描述', trigger: 'blur' }
  ]
}

function resetForm() {
  Object.keys(form).forEach(key => {
    form[key] = ''
  })
  if (roleForm.value) {
    roleForm.value.resetFields()
  }
}

function handleAdd() {
  dialogType.value = 'add'
  resetForm()
  dialogVisible.value = true
}

function handleEdit(row) {
  dialogType.value = 'edit'
  Object.keys(form).forEach(key => {
    form[key] = row[key]
  })
  dialogVisible.value = true
}

function handlePermission(row) {
  // 模拟获取角色权限
  selectedPermissions.value = [111, 112, 21, 22]
  permissionDialogVisible.value = true
}

function handleDelete(row) {
  if (row.isSystem) {
    ElMessage.warning('系统角色不能删除')
    return
  }
  
  ElMessageBox.confirm(
    '确定要删除该角色吗？此操作不可恢复！',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    roles.value = roles.value.filter(role => role.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

async function handleSubmit() {
  if (!roleForm.value) return
  
  await roleForm.value.validate((valid) => {
    if (valid) {
      submitting.value = true
      // 模拟API调用
      setTimeout(() => {
        if (dialogType.value === 'add') {
          const newRole = {
            id: roles.value.length + 1,
            ...form,
            createTime: new Date().toLocaleString(),
            isSystem: false
          }
          roles.value.push(newRole)
          ElMessage.success('添加成功')
        } else {
          const index = roles.value.findIndex(r => r.id === form.id)
          if (index !== -1) {
            roles.value[index] = { ...roles.value[index], ...form }
            ElMessage.success('更新成功')
          }
        }
        submitting.value = false
        dialogVisible.value = false
      }, 1000)
    }
  })
}

function handleSavePermissions() {
  if (!permissionTree.value) return
  
  const checkedKeys = permissionTree.value.getCheckedKeys()
  const halfCheckedKeys = permissionTree.value.getHalfCheckedKeys()
  
  savingPermissions.value = true
  // 模拟API调用
  setTimeout(() => {
    console.log('Selected permissions:', [...checkedKeys, ...halfCheckedKeys])
    ElMessage.success('权限设置成功')
    savingPermissions.value = false
    permissionDialogVisible.value = false
  }, 1000)
}
</script>

<style scoped>
.role-list {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.custom-tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 8px;
}

.permission-code {
  color: #909399;
  font-size: 12px;
}
</style>