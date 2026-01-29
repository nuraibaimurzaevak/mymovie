// 📁 backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json());

// Логирование запросов
app.use((req, res, next) => {
  console.log(`📥 [${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ========== ТЕСТОВЫЕ ENDPOINTS (добавьте перед другими маршрутами) ==========
app.get('/api/health', (req, res) => {
  console.log('✅ Health check called');
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/debug', (req, res) => {
  console.log('✅ Debug endpoint called');
  res.json({
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
    message: 'Backend is working!'
  });
});


// В server.js добавьте перед другими роутами:
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    server: 'running',
    database: 'connected',
    timestamp: new Date().toISOString()
  });
});
// ========== КОНЕЦ ТЕСТОВЫХ ENDPOINTS ==========

// Маршруты
app.use('/api/auth', require('./routes/auth'));
app.use('/api/collections', require('./routes/routerCollection'));
app.use('/api/movies', require('./routes/routerMovie'));
// Другие роуты...

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  console.error('❌ Stack:', err.stack);
  res.status(500).json({ 
    error: 'Что-то пошло не так!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Обработка необработанных исключений
process.on('uncaughtException', (error) => {
  console.error('🔥 UNCAUGHT EXCEPTION:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 UNHANDLED REJECTION at:', promise, 'reason:', reason);
});