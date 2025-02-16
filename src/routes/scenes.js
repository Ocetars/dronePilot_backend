const express = require('express');
const router = express.Router();
const Scene = require('../models/Scene');
const { requireAuth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

// 使用 Clerk 提供的中间件
const requireAuthClerk = ClerkExpressRequireAuth({
  // 可选：自定义错误处理
  onError: (err, req, res) => {
    console.error('认证错误:', err);
    res.status(401).json({
      success: false,
      message: '未经授权的访问'
    });
  }
});

// 验证中间件
const validateScene = [
  body('userId').notEmpty().withMessage('用户ID不能为空'),
  body('groundWidth').isNumeric().withMessage('地面宽度必须是数字'),
  body('groundDepth').isNumeric().withMessage('地面深度必须是数字'),
  body('texture').notEmpty().withMessage('纹理不能为空')
];

// 获取场景列表
router.get('/', requireAuthClerk, async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '缺少 userId 参数'
      });
    }

    const scenes = await Scene.find({ userId }).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: scenes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 保存场景
router.post('/', requireAuthClerk, validateScene, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { userId, groundWidth, groundDepth, texture } = req.body;
    const scene = new Scene({
      userId,
      groundWidth,
      groundDepth,
      texture
    });
    await scene.save();
    res.json({
      success: true,
      data: scene
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 删除场景
router.delete('/:id', requireAuthClerk, async (req, res) => {
  try {
    const scene = await Scene.findByIdAndDelete(req.params.id);
    if (!scene) {
      return res.status(404).json({
        success: false,
        message: '场景不存在'
      });
    }
    res.json({
      success: true,
      data: { id: scene._id }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router; 