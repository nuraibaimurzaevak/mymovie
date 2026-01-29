// 📁 middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('Токен не предоставлен');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ 
      _id: decoded.userId,
      'tokens.token': token
    });

    if (!user) {
      throw new Error('Пользователь не найден');
    }

    if (user.is_banned) {
      throw new Error('Аккаунт заблокирован');
    }

    // Обновляем время последней активности
    user.tokens = user.tokens.map(t => {
      if (t.token === token) {
        t.last_used = new Date();
      }
      return t;
    });
    
    await user.save();

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ 
      error: 'Пожалуйста, авторизуйтесь',
      message: error.message 
    });
  }
};

module.exports = { auth };