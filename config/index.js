module.exports = {
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    webhookUrl: process.env.WEBHOOK_URL
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_ANON_KEY
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o-mini'
  },
  perplexity: {
    apiKey: process.env.PERPLEXITY_API_KEY
  },
  admin: {
    chatIds: process.env.ADMIN_CHAT_IDS?.split(',') || []
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
  rateLimit: {
    windowMs: 60 * 1000, // 1 минута
    max: 30 // максимум 30 запросов в минуту
  }
}; 