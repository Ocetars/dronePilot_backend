const mongoose = require('mongoose');

const SceneSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  groundWidth: {
    type: Number,
    required: true
  },
  groundDepth: {
    type: Number,
    required: true
  },
  texture: {
    type: String,
    required: true,
    description: 'Base64 encoded texture image'
  },
  thumbnailTexture: {
    type: String,
    required: false,
    description: 'Base64 encoded thumbnail of texture image'
  }
}, { 
  timestamps: true
});

module.exports = mongoose.model('Scene', SceneSchema); 