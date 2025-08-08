 require('dotenv').config();
 const express = require('express');
 const app = express();
+const axios = require('axios'); // <-- нужен

 // Middleware
 app.use(express.json({ limit: '10mb' }));
 app.use(express.urlencoded({ extended: true }));

 // Health check (должен быть первым)
 app.get('/health', (req, res) => {
   res.json({ 
     status: 'OK', 
     timestamp: new Date().toISOString(),
     version: '1.0.0',
     environment: process.env.NODE_ENV || 'development'
   });
 });

 // Test endpoint...
 // ... (как было)

 // --- ВАЖНО: не вешаем глобальные миддлвары на webhook/health/test ---
- app.use(rateLimiter);
- app.use(adminAuth);
+// сначала объявим «белые» роуты, а потом миддлвары

 // Routes
 if (process.env.ENABLE_WEBHOOK === 'true') {
   app.post('/webhook/telegram', async (req, res) => {
     try {
       console.log('📥 Webhook received:', JSON.stringify(req.body, null, 2));
       // ... (твоё тело обработчика как есть)
     } catch (error) {
       console.error('Webhook error:', error);
       res.status(200).json({ status: 'error', message: error.message });
     }
   });
 } else {
   app.post('/webhook/telegram', (req, res) => {
     res.status(200).json({ 
       status: 'webhook_disabled',
       message: 'Webhook отключен. Установите ENABLE_WEBHOOK=true для активации'
     });
   });
 }

+// Теперь включаем миддлвары ДЛЯ остальных маршрутов
+app.use((req, res, next) => {
+  const open = ['/health', '/test', '/test/ai', '/webhook/telegram'];
+  if (open.includes(req.path) || req.path.startsWith('/test')) return next();
+  return rateLimiter(req, res, () => adminAuth(req, res, next));
+});

 // ... остальное как было

 // Запуск сервера + регистрация/снятие вебхука
-const PORT = process.env.PORT || 3000;
-app.listen(PORT, () => {
-  console.log(`🤖 Aromatherapy Bot running on port ${PORT}`);
-  console.log(`📊 Health check: http://localhost:${PORT}/health`);
-});
+const PORT = process.env.PORT || 8080;
+app.listen(PORT, '0.0.0.0', async () => {
+  console.log(`🤖 Aromatherapy Bot running on port ${PORT}`);
+  console.log(`📊 Health check: /health`);
+
+  const token = process.env.TELEGRAM_BOT_TOKEN;
+  if (!token) return console.error('❌ TELEGRAM_BOT_TOKEN отсутствует');
+
+  try {
+    if (process.env.ENABLE_WEBHOOK === 'true') {
+      const base = process.env.WEBHOOK_URL; // например https://xxx.up.railway.app
+      if (!base) throw new Error('WEBHOOK_URL не задан');
+      const url = `${base}/webhook/telegram`;
+      // снимаем старый, ставим новый
+      await axios.get(`https://api.telegram.org/bot${token}/deleteWebhook`);
+      await axios.get(`https://api.telegram.org/bot${token}/setWebhook`, {
+        params: { url }
+      });
+      const info = await axios.get(`https://api.telegram.org/bot${token}/getWebhookInfo`);
+      console.log('🔗 Webhook set to:', info.data.result.url);
+    } else {
+      // polling-режим предполагается где-то внутри TelegramService
+      await axios.get(`https://api.telegram.org/bot${token}/deleteWebhook`);
+      console.log('🧹 Webhook deleted, используем polling (если включён в коде)');
+    }
+  } catch (e) {
+    console.error('⚠️ Webhook setup error:', e?.response?.data || e.message);
+  }
+});
