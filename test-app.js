const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const SmartRouter = require('./src/services/smart-router');
const TestOilService = require('./test-oil-service');
const TestAIService = require('./test-ai-service');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Initialize services
const smartRouter = new SmartRouter();
const oilService = new TestOilService();
const aiService = new TestAIService();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      smartRouter: 'active',
      oilService: 'active',
      aiService: 'active'
    }
  });
});

// Test endpoint for oil search
app.post('/test/oil-search', async (req, res) => {
  try {
    const { oilName } = req.body;
    
    if (!oilName) {
      return res.status(400).json({ error: 'Oil name is required' });
    }

    const oil = await oilService.searchOil(oilName);
    
    if (oil) {
      const formattedInfo = oilService.formatOilInfo(oil);
      res.json({
        success: true,
        oil: oil,
        formattedInfo: formattedInfo
      });
    } else {
      const suggestions = oilService.getSuggestions(oilName);
      const notFoundMessage = oilService.formatNotFoundMessage(oilName, suggestions);
      res.json({
        success: false,
        message: notFoundMessage,
        suggestions: suggestions
      });
    }
  } catch (error) {
    console.error('Error in oil search:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test endpoint for smart router
app.post('/test/smart-router', (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const result = smartRouter.analyzeRequest({
      json: {
        message: {
          text: text,
          chat: { id: 123 },
          from: { id: 456, first_name: 'Test' }
        }
      }
    });

    res.json({
      success: true,
      originalText: text,
      result: result
    });
  } catch (error) {
    console.error('Error in smart router:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test endpoint for AI recommendations
app.post('/test/ai-recommendation', async (req, res) => {
  try {
    const { mood, keywords } = req.body;
    
    if (!mood) {
      return res.status(400).json({ error: 'Mood is required' });
    }

    const oils = await oilService.getAllOils();
    const recommendation = await aiService.getMoodRecommendation(mood, oils, keywords);

    res.json({
      success: true,
      mood: mood,
      keywords: keywords || [],
      recommendation: recommendation
    });
  } catch (error) {
    console.error('Error in AI recommendation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test endpoint for music recommendations
app.post('/test/music-recommendation', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const request = { originalText: text };
    const musicRecommendation = await aiService.getMusicRecommendation(request);

    res.json({
      success: true,
      originalText: text,
      recommendation: musicRecommendation
    });
  } catch (error) {
    console.error('Error in music recommendation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test endpoint for all services
app.get('/test/services', async (req, res) => {
  try {
    // Test Smart Router
    const routerTest = smartRouter.analyzeRequest({
      json: {
        message: {
          text: 'лаванда',
          chat: { id: 123 },
          from: { id: 456, first_name: 'Test' }
        }
      }
    });

    // Test Oil Service
    const oilTest = await oilService.searchOil('лаванда');
    const suggestionsTest = oilService.getSuggestions('лав');

    // Test AI Service
    const oils = await oilService.getAllOils();
    const aiTest = await aiService.getMoodRecommendation('энергия', oils);

    res.json({
      success: true,
      services: {
        smartRouter: {
          status: 'active',
          testResult: routerTest
        },
        oilService: {
          status: 'active',
          oilFound: !!oilTest,
          suggestions: suggestionsTest
        },
        aiService: {
          status: 'active',
          recommendationLength: aiTest.length
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error testing services:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🧪 Test server started on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 Test endpoints:`);
  console.log(`   POST /test/oil-search - поиск масла`);
  console.log(`   POST /test/smart-router - анализ запроса`);
  console.log(`   POST /test/ai-recommendation - AI рекомендации`);
  console.log(`   POST /test/music-recommendation - музыкальные советы`);
  console.log(`   GET /test/services - тест всех сервисов`);
  console.log('');
  console.log('🌿 Все агенты готовы к работе!');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
}); 