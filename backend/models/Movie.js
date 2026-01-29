// 📁 models/Movie.js
const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
  // Основная информация
  title: {
    type: String,
    required: true,
    index: true
  },
  original_title: String,
  year: Number,
  description: String,
  
  // Метаданные из внешних API
  external_ids: {
    kinopoisk_id: String,
    imdb_id: String,
    tmdb_id: String
  },
  
  // Детали
  type: {
    type: String,
    enum: ['movie', 'tv_series', 'anime', 'cartoon', 'documentary'],
    default: 'movie'
  },
  status: {
    type: String,
    enum: ['released', 'upcoming', 'ongoing', 'cancelled'],
    default: 'released'
  },
  
  // Жанры и категории
  genres: [{
    id: Number,
    name: String
  }],
  countries: [String],
  
  // Рейтинги
  ratings: {
    kinopoisk: Number,
    imdb: Number,
    local: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 }
    }
  },
  
  // Время и серии
  duration: Number, // в минутах
  total_episodes: Number,
  total_seasons: Number,
  
  // Изображения
  poster: String,
  backdrop: String,
  screenshots: [String],
  
  // Люди
  directors: [String],
  actors: [String],
  
  // Ссылки
  trailers: [{
    site: String,
    key: String
  }],
  
  // Статистика сайта
  stats: {
    views: { type: Number, default: 0 },
    favorites: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    collections: { type: Number, default: 0 }
  },
  
  // Кэшированные данные
  cached_data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  last_updated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Индексы
MovieSchema.index({ title: 'text', original_title: 'text', description: 'text' });
MovieSchema.index({ year: -1 });
MovieSchema.index({ 'ratings.local.average': -1 });
MovieSchema.index({ 'stats.views': -1 });

module.exports = mongoose.model('Movie', MovieSchema);