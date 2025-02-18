require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('../src/config/db');
const scenesRouter = require('../src/routes/scenes');

const app = express();

// 连接数据库
connectDB();

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'dronepilot-backend'
  });
});

app.get("/", (req, res) => res.send("Express on Vercel"));

// 路由
app.use('/api/scenes', scenesRouter);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: '服务器内部错误'
  });
});

module.exports = app; 