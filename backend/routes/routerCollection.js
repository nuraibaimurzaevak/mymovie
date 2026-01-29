// 📁 backend/routes/routerCollection.js
const express = require('express');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Временно: мок пользователь
const mockUserId = '65f7a1b2c3d4e5f6a7b8c9d0';

// Мок данные
const mockCollections = [
  {
    _id: 'custom1',
    name: 'Семейные',
    icon: '👨‍👩‍👧‍👦',
    color: '#3B82F6',
    description: 'Для просмотра с семьей',
    movieCount: 18,
    isPublic: false,
    createdAt: new Date('2023-01-15'),
    movies: [
      {
        movieId: '1',
        title: 'Зверополис',
        year: 2016,
        rating: 8.0,
        poster: 'https://via.placeholder.com/200x300/3B82F6/FFFFFF?text=Зверополис',
        addedAt: new Date('2023-01-15')
      },
      {
        movieId: '2',
        title: 'Холодное сердце',
        year: 2013,
        rating: 7.5,
        poster: 'https://via.placeholder.com/200x300/3B82F6/FFFFFF?text=Холодное+сердце',
        addedAt: new Date('2023-02-20')
      }
    ]
  },
  {
    _id: 'custom2',
    name: 'Классика',
    icon: '🎭',
    color: '#8B4513',
    description: 'Фильмы-классики',
    movieCount: 25,
    isPublic: true,
    createdAt: new Date('2023-02-01'),
    movies: [
      {
        movieId: '3',
        title: 'Крестный отец',
        year: 1972,
        rating: 9.2,
        poster: 'https://via.placeholder.com/200x300/8B4513/FFFFFF?text=Крестный+отец',
        addedAt: new Date('2023-03-10')
      }
    ]
  }
];

// Получить все коллекции пользователя
router.get('/my', async (req, res) => {
  try {
    console.log('📥 GET /api/collections/my запрос получен');
    
    // Имитация задержки
    await new Promise(resolve => setTimeout(resolve, 300));
    
    res.json({
      collections: mockCollections,
      favoritesCount: 24,
      watchingCount: 5,
      plannedCount: 42,
      completedCount: 156,
      droppedCount: 8
    });
  } catch (error) {
    console.error('❌ Ошибка:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Создать коллекцию
router.post('/', [
  body('name').trim().notEmpty().withMessage('Название обязательно'),
  body('description').optional().trim(),
  body('icon').optional().trim(),
  body('color').optional().trim(),
  body('isPublic').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    console.log('📥 POST /api/collections запрос получен:', req.body);
    
    // Имитация сохранения в БД
    const newCollection = {
      _id: `col_${Date.now()}`,
      name: req.body.name,
      description: req.body.description || 'Моя коллекция',
      icon: req.body.icon || '📁',
      color: req.body.color || '#8B5CF6',
      isPublic: req.body.isPublic || false,
      movieCount: 0,
      owner: mockUserId,
      movies: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    mockCollections.push(newCollection);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    res.status(201).json(newCollection);
  } catch (error) {
    console.error('❌ Ошибка создания:', error);
    res.status(500).json({ message: 'Ошибка создания коллекции' });
  }
});

// Получить коллекцию по ID
router.get('/:id', async (req, res) => {
  try {
    console.log(`📥 GET /api/collections/${req.params.id} запрос получен`);
    
    // Имитация поиска
    const collection = mockCollections.find(c => c._id === req.params.id);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (collection) {
      res.json(collection);
    } else {
      res.status(404).json({ 
        message: 'Коллекция не найдена',
        availableIds: mockCollections.map(c => c._id)
      });
    }
  } catch (error) {
    console.error('❌ Ошибка получения:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновить коллекцию
router.put('/:id', async (req, res) => {
  try {
    console.log(`📥 PUT /api/collections/${req.params.id} запрос получен:`, req.body);
    
    const index = mockCollections.findIndex(c => c._id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Коллекция не найдена' });
    }
    
    // Обновляем коллекцию
    mockCollections[index] = {
      ...mockCollections[index],
      ...req.body,
      updatedAt: new Date()
    };
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    res.json(mockCollections[index]);
  } catch (error) {
    console.error('❌ Ошибка обновления:', error);
    res.status(500).json({ message: 'Ошибка обновления' });
  }
});

// Удалить коллекцию
router.delete('/:id', async (req, res) => {
  try {
    console.log(`📥 DELETE /api/collections/${req.params.id} запрос получен`);
    
    const index = mockCollections.findIndex(c => c._id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Коллекция не найдена' });
    }
    
    const deleted = mockCollections.splice(index, 1)[0];
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    res.json({ 
      message: 'Коллекция удалена',
      id: deleted._id,
      name: deleted.name
    });
  } catch (error) {
    console.error('❌ Ошибка удаления:', error);
    res.status(500).json({ message: 'Ошибка удаления' });
  }
});

// Получить популярные коллекции
router.get('/popular', async (req, res) => {
  try {
    console.log('📥 GET /api/collections/popular запрос получен');
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    res.json([
      {
        _id: 'popular1',
        name: 'Лучшие фильмы 2024',
        icon: '🏆',
        color: '#F59E0B',
        movieCount: 25,
        owner: { username: 'Киноман' }
      },
      {
        _id: 'popular2',
        name: 'Классика кино',
        icon: '🎭',
        color: '#8B4513',
        movieCount: 50,
        owner: { username: 'Критик' }
      }
    ]);
  } catch (error) {
    console.error('❌ Ошибка:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router; // ✅ Изменили export default на module.exports