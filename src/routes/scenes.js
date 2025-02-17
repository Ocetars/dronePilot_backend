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

// 验证base64图片格式
const isValidBase64Image = (base64String) => {
  if (!base64String) return false;
  try {
    // 检查是否是有效的base64格式
    const regex = /^data:image\/(png|jpeg|jpg|gif);base64,/;
    if (!regex.test(base64String)) return false;
    
    // 检查base64数据部分
    const base64Data = base64String.split(',')[1];
    return /^[A-Za-z0-9+/]+=*$/.test(base64Data);
  } catch (error) {
    return false;
  }
};

// 验证中间件
const validateScene = [
  body('userId').notEmpty().withMessage('用户ID不能为空'),
  body('groundWidth').isNumeric().withMessage('地面宽度必须是数字'),
  body('groundDepth').isNumeric().withMessage('地面深度必须是数字'),
  body('texture')
    .notEmpty().withMessage('纹理不能为空')
    .custom((value) => {
      if (!isValidBase64Image(value)) {
        throw new Error('纹理必须是有效的base64编码图片');
      }
      return true;
    }),
  body('thumbnailTexture')
    .optional()
    .custom((value) => {
      if (value && !isValidBase64Image(value)) {
        throw new Error('缩略图必须是有效的base64编码图片');
      }
      return true;
    })
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

    const { userId, groundWidth, groundDepth, texture, thumbnailTexture } = req.body;
    
    // 检查base64数据大小
    const base64Size = Buffer.from(texture.split(',')[1], 'base64').length;
    if (base64Size > 5 * 1024 * 1024) { // 5MB限制
      return res.status(400).json({
        success: false,
        message: '图片大小不能超过5MB'
      });
    }

    const scene = new Scene({
      userId,
      groundWidth,
      groundDepth,
      texture,
      thumbnailTexture
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