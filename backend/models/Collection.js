// 📁 backend/models/Collection.js
import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    trim: true,
    maxlength: 200,
    default: ''
  },
  icon: {
    type: String,
    default: '📁'
  },
  color: {
    type: String,
    default: '#8B5CF6'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  movieCount: {
    type: Number,
    default: 0
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  movies: [{
    movieId: {
      type: String,
      required: true
    },
    title: String,
    poster: String,
    year: Number,
    rating: Number,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Создаем модель
const Collection = mongoose.model('Collection', collectionSchema);

export default Collection;