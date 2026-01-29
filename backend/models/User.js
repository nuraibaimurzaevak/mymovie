// 📁 models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  // Основная информация
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    lowercase: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Пожалуйста, введите корректный email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatar: {
    type: String,
    default: ''
  },
  
  // Дополнительная информация
  full_name: String,
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  birth_date: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say', null],
    default: null
  },
  
  // Настройки
  settings: {
    email_notifications: { type: Boolean, default: true },
    theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' },
    language: { type: String, default: 'ru' }
  },
  
  // Статистика
  stats: {
    reviews_count: { type: Number, default: 0 },
    collections_count: { type: Number, default: 0 },
    watchlist_count: { type: Number, default: 0 },
    watched_count: { type: Number, default: 0 },
    last_active: { type: Date, default: Date.now }
  },
  
  // Роль пользователя
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  },
  
  // Системные поля
  is_verified: { type: Boolean, default: false },
  is_banned: { type: Boolean, default: false },
  ban_reason: String,
  
  // Токены для авторизации
  tokens: [{
    token: {
      type: String,
      required: true
    },
    device_info: String,
    last_used: Date
  }],
  
  // Восстановление пароля
  reset_password_token: String,
  reset_password_expires: Date,
  
  // Дата регистрации
  registered_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.tokens;
      delete ret.reset_password_token;
      delete ret.reset_password_expires;
      return ret;
    }
  }
});

// Хеширование пароля перед сохранением
UserSchema.pre('save', async function(next) {
  const user = this;
  
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  
  next();
});

// Генерация JWT токена
UserSchema.methods.generateAuthToken = async function(deviceInfo = '') {
  const user = this;
  const token = jwt.sign(
    { userId: user._id.toString() }, 
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  // Сохраняем токен в базу
  user.tokens = user.tokens.concat({
    token,
    device_info: deviceInfo,
    last_used: new Date()
  });
  
  await user.save();
  return token;
};

// Поиск по учетным данным
UserSchema.statics.findByCredentials = async function(emailOrUsername, password) {
  const user = await this.findOne({
    $or: [
      { email: emailOrUsername.toLowerCase() },
      { username: emailOrUsername.toLowerCase() }
    ]
  });
  
  if (!user) {
    throw new Error('Неверный email/username или пароль');
  }
  
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  
  if (!isPasswordMatch) {
    throw new Error('Неверный email/username или пароль');
  }
  
  return user;
};

// Проверка существования пользователя
UserSchema.statics.isUsernameTaken = async function(username) {
  const user = await this.findOne({ username: username.toLowerCase() });
  return !!user;
};

UserSchema.statics.isEmailTaken = async function(email) {
  const user = await this.findOne({ email: email.toLowerCase() });
  return !!user;
};

module.exports = mongoose.model('User', UserSchema);