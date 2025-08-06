module.exports = {
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    webhookUrl: process.env.WEBHOOK_URL,
    apiUrl: 'https://api.telegram.org/bot'
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_ANON_KEY
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o-mini',
    maxTokens: 2000
  },
  perplexity: {
    apiKey: process.env.PERPLEXITY_API_KEY,
    model: 'llama-3.1-sonar-small-128k-online'
  },
  admin: {
    chatIds: process.env.ADMIN_CHAT_IDS?.split(',').map(id => parseInt(id.trim())) || []
  },
  app: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development'
  },
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development'
  },
  notifications: {
    morningTime: '09:00',
    eveningTime: '20:00',
    defaultTimezone: 'Europe/Moscow'
  },
  rateLimiting: {
    windowMs: 60 * 1000, // 1 минута
    maxRequests: 30 // максимум 30 запросов в минуту
  },
  rateLimit: {
    windowMs: 60 * 1000, // 1 минута
    max: 30 // максимум 30 запросов в минуту
  }
}; 