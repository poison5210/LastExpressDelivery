import { defineStore } from 'pinia'
import { ref } from 'vue'
import OpenAIService from '../utils/openai'

export const useChatStore = defineStore('chat', () => {
  const messages = ref([])
  const isTyping = ref(false)
  const conversationHistory = ref([])
  
  // 添加消息
  function addMessage(message) {
    const newMessage = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString().slice(0, 5),
      ...message
    }
    messages.value.push(newMessage)
    
    // 更新对话历史（用于AI上下文）
    if (message.type === 'user' || message.type === 'ai') {
      conversationHistory.value.push({
        role: message.type === 'user' ? 'user' : 'assistant',
        content: message.content
      })
    }
    
    return newMessage
  }
  
  // 发送消息给AI
  async function sendToAI(userMessage, useStream = true) {
    // 添加用户消息
    addMessage({
      type: 'user',
      sender: '您',
      content: userMessage
    })
    
    isTyping.value = true
    
    try {
      const contextMessages = OpenAIService.buildContextMessages(
        userMessage, 
        conversationHistory.value
      )
      
      if (useStream) {
        // 流式响应
        const aiMessage = addMessage({
          type: 'ai',
          sender: 'AI助手',
          content: '',
          streaming: true
        })
        
        await OpenAIService.streamChat(
          contextMessages,
          (chunk) => {
            aiMessage.content += chunk
          },
          {
            temperature: 0.7,
            maxTokens: 1000
          }
        )
        
        aiMessage.streaming = false
        
        // 更新对话历史
        conversationHistory.value.push({
          role: 'assistant',
          content: aiMessage.content
        })
        
      } else {
        // 普通响应
        const response = await OpenAIService.chat(contextMessages, {
          temperature: 0.7,
          maxTokens: 1000
        })
        
        const aiContent = response.choices[0]?.message?.content || '抱歉，我现在无法回答这个问题。'
        
        addMessage({
          type: 'ai',
          sender: 'AI助手',
          content: aiContent
        })
      }
      
    } catch (error) {
      console.error('AI对话错误:', error)
      
      let errorMessage = '抱歉，我现在遇到了一些技术问题。'
      
      if (error.message.includes('API Key')) {
        errorMessage = '系统配置问题，请联系管理员配置OpenAI API密钥。'
      } else if (error.message.includes('quota')) {
        errorMessage = 'API调用额度不足，请联系管理员。'
      } else if (error.message.includes('rate limit')) {
        errorMessage = '请求过于频繁，请稍后再试。'
      }
      
      addMessage({
        type: 'ai',
        sender: 'AI助手',
        content: errorMessage,
        error: true
      })
    } finally {
      isTyping.value = false
    }
  }
  
  // 清空对话
  function clearMessages() {
    messages.value = []
    conversationHistory.value = []
  }
  
  // 重新生成回复
  async function regenerateLastResponse() {
    if (messages.value.length < 2) return
    
    // 移除最后一条AI回复
    const lastMessage = messages.value[messages.value.length - 1]
    if (lastMessage.type === 'ai') {
      messages.value.pop()
      conversationHistory.value.pop()
    }
    
    // 获取最后一条用户消息
    const lastUserMessage = messages.value
      .slice()
      .reverse()
      .find(msg => msg.type === 'user')
    
    if (lastUserMessage) {
      await sendToAI(lastUserMessage.content)
    }
  }
  
  return {
    messages,
    isTyping,
    conversationHistory,
    addMessage,
    sendToAI,
    clearMessages,
    regenerateLastResponse
  }
})