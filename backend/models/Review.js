const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  // Основные ссылки
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Содержимое отзыва
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    validate: {
      validator: Number.isInteger,
      message: 'Рейтинг должен быть целым числом от 1 до 10'
    }
  },
  title: {
    type: String,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    minlength: 50,
    maxlength: 5000,
    trim: true
  },
  
  // Метаданные
  is_spoiler: {
    type: Boolean,
    default: false
  },
  is_edited: {
    type: Boolean,
    default: false
  },
  edit_history: [{
    content: String,
    edited_at: Date
  }],
  status: {
    type: String,
    enum: ['published', 'hidden', 'deleted', 'pending'],
    default: 'published'
  },
  moderation_notes: String,
  
  // Взаимодействия
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  }],
  dislikes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  }],
  helpful_count: {
    type: Number,
    default: 0
  },
  
  // Визуальные элементы
  screenshots: [String],
  user_rating_breakdown: {
    story: { type: Number, min: 0, max: 10 },
    direction: { type: Number, min: 0, max: 10 },
    acting: { type: Number, min: 0, max: 10 },
    music: { type: Number, min: 0, max: 10 },
    visuals: { type: Number, min: 0, max: 10 }
  },
  
  // Комментарии к отзыву
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    status: {
      type: String,
      enum: ['published', 'deleted'],
      default: 'published'
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Статистика
  views: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Составной уникальный индекс - один отзыв на фильм от пользователя
ReviewSchema.index({ movie: 1, user: 1 }, { unique: true });

// Индексы для сортировки
ReviewSchema.index({ rating: -1, created_at: -1 });
ReviewSchema.index({ helpful_count: -1, created_at: -1 });
ReviewSchema.index({ 'user_rating_breakdown.story': -1 });
ReviewSchema.index({ 'comments.likes': -1 });

// Виртуальное поле для расчета полезности
ReviewSchema.virtual('total_likes').get(function() {
  return this.likes.length;
});

ReviewSchema.virtual('total_dislikes').get(function() {
  return this.dislikes.length;
});

// Методы
ReviewSchema.methods.hasLiked = function(userId) {
  return this.likes.some(id => id.equals(userId));
};

ReviewSchema.methods.hasDisliked = function(userId) {
  return this.dislikes.some(id => id.equals(userId));
};

ReviewSchema.methods.addComment = async function(userId, content) {
  this.comments.push({
    user: userId,
    content: content
  });
  await this.save();
  return this.comments[this.comments.length - 1];
};

ReviewSchema.methods.toggleLike = async function(userId) {
  const hasLiked = this.hasLiked(userId);
  const hasDisliked = this.hasDisliked(userId);
  
  if (hasLiked) {
    // Убрать лайк
    this.likes = this.likes.filter(id => !id.equals(userId));
  } else {
    // Добавить лайк
    this.likes.push(userId);
    // Убрать дизлайк если есть
    if (hasDisliked) {
      this.dislikes = this.dislikes.filter(id => !id.equals(userId));
    }
  }
  
  this.helpful_count = this.likes.length - this.dislikes.length;
  await this.save();
  return this;
};

ReviewSchema.methods.toggleDislike = async function(userId) {
  const hasLiked = this.hasLiked(userId);
  const hasDisliked = this.hasDisliked(userId);
  
  if (hasDisliked) {
    // Убрать дизлайк
    this.dislikes = this.dislikes.filter(id => !id.equals(userId));
  } else {
    // Добавить дизлайк
    this.dislikes.push(userId);
    // Убрать лайк если есть
    if (hasLiked) {
      this.likes = this.likes.filter(id => !id.equals(userId));
    }
  }
  
  this.helpful_count = this.likes.length - this.dislikes.length;
  await this.save();
  return this;
};

// Статический метод для получения рейтинга фильма
ReviewSchema.statics.getMovieRatingStats = async function(movieId) {
  const reviews = await this.find({ 
    movie: movieId, 
    status: 'published' 
  });
  
  if (reviews.length === 0) {
    return {
      average: 0,
      count: 0,
      distribution: Array(10).fill(0),
      breakdown: {
        story: 0,
        direction: 0,
        acting: 0,
        music: 0,
        visuals: 0
      }
    };
  }
  
  const ratings = reviews.map(r => r.rating);
  const distribution = Array(10).fill(0);
  ratings.forEach(rating => {
    distribution[rating - 1]++;
  });
  
  // Расчет средних значений по категориям
  const breakdown = { story: 0, direction: 0, acting: 0, music: 0, visuals: 0 };
  let breakdownCount = 0;
  
  reviews.forEach(review => {
    if (review.user_rating_breakdown) {
      Object.keys(breakdown).forEach(key => {
        if (review.user_rating_breakdown[key]) {
          breakdown[key] += review.user_rating_breakdown[key];
        }
      });
      breakdownCount++;
    }
  });
  
  if (breakdownCount > 0) {
    Object.keys(breakdown).forEach(key => {
      breakdown[key] = Math.round((breakdown[key] / breakdownCount) * 10) / 10;
    });
  }
  
  return {
    average: ratings.reduce((a, b) => a + b, 0) / ratings.length,
    count: reviews.length,
    distribution,
    breakdown
  };
};

module.exports = mongoose.model('Review', ReviewSchema);