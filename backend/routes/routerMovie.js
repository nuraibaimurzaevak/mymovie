const express = require('express');
const router = express.Router();
const TMDBService = require('../services/tmdbService');

// Популярные фильмы
router.get('/popular', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const data = await TMDBService.getPopularMovies(page);
    res.json(data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Ошибка загрузки фильмов', 
      details: error.message 
    });
  }
});

// Новые фильмы
router.get('/new', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const data = await TMDBService.getNowPlaying(page);
    res.json(data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Ошибка загрузки новых фильмов', 
      details: error.message 
    });
  }
});

// Топ фильмы
router.get('/top', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const data = await TMDBService.getTopRated(page);
    res.json(data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Ошибка загрузки топ фильмов', 
      details: error.message 
    });
  }
});

// Поиск фильмов
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Необходим поисковый запрос' });
    }
    
    const response = await TMDBService.client.get('/search/movie', {
      params: { query: q, language: 'ru-RU' }
    });
    
    res.json({
      page: response.data.page,
      results: response.data.results,
      total_pages: response.data.total_pages
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Ошибка поиска', 
      details: error.message 
    });
  }
});

module.exports = router;