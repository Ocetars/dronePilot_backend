const mongoose = require('mongoose');

const SceneSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
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
    required: true
  }
}, { 
  timestamps: true
});

module.exports = mongoose.model('Scene', SceneSchema); 