const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

const requireAuth = ClerkExpressRequireAuth({
  onError: (err, req, res) => {
    res.status(401).json({
      success: false,
      message: '未授权访问'
    });
  }
});

module.exports = { requireAuth }; 