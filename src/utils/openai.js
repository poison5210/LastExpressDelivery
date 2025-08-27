// OpenAI API 配置和工具函数
class OpenAIService {
  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY
    this.baseURL = 'https://api.openai.com/v1'
    this.model = 'gpt-3.5-turbo'
  }

  async chat(messages, options = {}) {
    if (!this.apiKey) {
      throw new Error('OpenAI API Key 未配置，请在环境变量中设置 VITE_OPENAI_API_KEY')
    }

    const requestBody = {
      model: options.model || this.model,
      messages: messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 1000,
      stream: options.stream || false,
      ...options
    }

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`OpenAI API 错误: ${error.error?.message || response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('OpenAI API 调用失败:', error)
      throw error
    }
  }

  async streamChat(messages, onChunk, options = {}) {
    if (!this.apiKey) {
      throw new Error('OpenAI API Key 未配置，请在环境变量中设置 VITE_OPENAI_API_KEY')
    }

    const requestBody = {
      model: options.model || this.model,
      messages: messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 1000,
      stream: true,
      ...options
    }

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`OpenAI API 错误: ${error.error?.message || response.statusText}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') return

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content
              if (content) {
                onChunk(content)
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error) {
      console.error('OpenAI 流式调用失败:', error)
      throw error
    }
  }

  // 构建系统提示词
  buildSystemPrompt() {
    return `你是一个专业的快递管理系统AI助手，名字叫"小智"。你的主要职责是：

1. 帮助用户解答快递管理相关问题
2. 提供业务数据分析和建议
3. 协助处理订单、配送、客服等业务流程
4. 提供系统使用指导和技术支持

请用友好、专业的语气回答用户问题，并尽可能提供具体、实用的建议。如果涉及具体的业务数据，可以结合当前系统的实际情况进行分析。`
  }

  // 构建上下文消息
  buildContextMessages(userMessage, conversationHistory = []) {
    const messages = [
      {
        role: 'system',
        content: this.buildSystemPrompt()
      }
    ]

    // 添加历史对话（保留最近10条）
    const recentHistory = conversationHistory.slice(-10)
    messages.push(...recentHistory)

    // 添加当前用户消息
    messages.push({
      role: 'user',
      content: userMessage
    })

    return messages
  }
}

export default new OpenAIService()