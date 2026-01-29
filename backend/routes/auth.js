// 📁 routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Регистрация
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Валидация
    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Пожалуйста, заполните все поля'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Пароль должен содержать минимум 6 символов'
      });
    }

    // Проверка уникальности
    const isUsernameTaken = await User.isUsernameTaken(username);
    if (isUsernameTaken) {
      return res.status(400).json({
        error: 'Это имя пользователя уже занято'
      });
    }

    const isEmailTaken = await User.isEmailTaken(email);
    if (isEmailTaken) {
      return res.status(400).json({
        error: 'Этот email уже зарегистрирован'
      });
    }

    // Создание пользователя
    const user = new User({
      username,
      email,
      password
    });

    await user.save();

    // Генерация токена
    const token = await user.generateAuthToken(req.headers['user-agent']);

    res.status(201).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        stats: user.stats
      },
      token
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Вход
router.post('/login', async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({
        error: 'Пожалуйста, заполните все поля'
      });
    }

    const user = await User.findByCredentials(emailOrUsername, password);
    const token = await user.generateAuthToken(req.headers['user-agent']);

    // Обновляем последнюю активность
    user.stats.last_active = new Date();
    await user.save();

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        stats: user.stats,
        role: user.role
      },
      token
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Выход
router.post('/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => {
      return token.token !== req.token;
    });

    await req.user.save();
    res.json({ message: 'Успешный выход из системы' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Выход со всех устройств
router.post('/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.json({ message: 'Успешный выход со всех устройств' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить текущего пользователя
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        avatar: req.user.avatar,
        full_name: req.user.full_name,
        bio: req.user.bio,
        stats: req.user.stats,
        settings: req.user.settings,
        role: req.user.role,
        registered_at: req.user.registered_at
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить профиль
router.patch('/me', auth, async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = ['full_name', 'bio', 'avatar', 'birth_date', 'gender', 'settings'];
    
    // Фильтруем только разрешенные поля
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    Object.assign(req.user, filteredUpdates);
    await req.user.save();

    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        avatar: req.user.avatar,
        full_name: req.user.full_name,
        bio: req.user.bio,
        stats: req.user.stats,
        settings: req.user.settings
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Проверить доступность имени пользователя
router.get('/check-username/:username', async (req, res) => {
  try {
    const isTaken = await User.isUsernameTaken(req.params.username);
    res.json({ available: !isTaken });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Проверить доступность email
router.get('/check-email/:email', async (req, res) => {
  try {
    const isTaken = await User.isEmailTaken(req.params.email);
    res.json({ available: !isTaken });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;