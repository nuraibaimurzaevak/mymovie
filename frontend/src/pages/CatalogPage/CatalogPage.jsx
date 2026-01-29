import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import Header from "../../components/Header";
import './CatalogPage.css';
import { Filter, Grid, List, Star, Calendar, ChevronDown, ChevronUp, Film } from 'lucide-react';

function CatalogPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  
  // Получаем фильтр из state или URL параметров
  const stateFilter = location.state?.initialFilter;
  const urlFilter = searchParams.get('filter') || searchParams.get('type');
  const activeFilter = stateFilter || urlFilter;
  const [title, setTitle] = useState('Каталог фильмов');

  const API_KEY = '7b9bc40c52751435482a34432b154abb';
  const BASE_URL = 'https://api.themoviedb.org/3';

  // Устанавливаем заголовок и сортировку по умолчанию на основе фильтра
  useEffect(() => {
    if (activeFilter === 'new') {
      setTitle('Новинки в кино');
      setSortBy('year'); // Сортировка по новизне
    } else if (activeFilter === 'popular') {
      setTitle('Популярные фильмы');
      setSortBy('popular'); // Сортировка по популярности
    } else if (activeFilter === 'genres') {
      setTitle('Фильмы по жанрам');
      setSortBy('popular');
    } else {
      setTitle('Каталог фильмов');
    }
  }, [activeFilter]);

  // Загрузка жанров
  useEffect(() => {
    const loadGenres = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=ru-RU`
        );
        const data = await response.json();
        setGenres(data.genres || []);
      } catch (error) {
        console.error('❌ Ошибка загрузки жанров:', error);
      }
    };
    
    loadGenres();
  }, []);

  // Основная функция загрузки фильмов с фильтрацией
  const loadMovies = useCallback(async () => {
    setLoading(true);
    try {
      let apiUrl = '';
      let params = new URLSearchParams({
        api_key: API_KEY,
        language: 'ru-RU',
        page: page.toString(),
        include_adult: 'false',
      });

      // Если выбран фильтр "новинки" и нет других фильтров
      if (activeFilter === 'new' && selectedGenres.length === 0 && !selectedYear && !selectedRating) {
        apiUrl = `${BASE_URL}/movie/now_playing`;
        setSortBy('year');
      }
      // Если выбран фильтр "популярное" и нет других фильтров
      else if (activeFilter === 'popular' && selectedGenres.length === 0 && !selectedYear && !selectedRating) {
        apiUrl = `${BASE_URL}/movie/popular`;
        setSortBy('popular');
      }
      // Если есть другие фильтры (жанры, год, рейтинг)
      else if (selectedGenres.length > 0 || selectedYear || selectedRating) {
        apiUrl = `${BASE_URL}/discover/movie`;
        
        if (selectedGenres.length > 0) {
          params.append('with_genres', selectedGenres.join(','));
        }
        
        if (selectedYear) {
          params.append('primary_release_year', selectedYear);
        }
        
        if (selectedRating) {
          const minRating = parseFloat(selectedRating);
          if (!isNaN(minRating)) {
            params.append('vote_average.gte', minRating);
          }
        }
        
        // Сортировка для discover
        const sortMap = {
          'popular': 'popularity.desc',
          'rating': 'vote_average.desc',
          'year': 'primary_release_date.desc',
          'title': 'original_title.asc'
        };
        params.append('sort_by', sortMap[sortBy] || 'popularity.desc');
      }
      // Обычный каталог
      else {
        const endpointMap = {
          'popular': 'movie/popular',
          'rating': 'movie/top_rated',
          'year': 'movie/now_playing',
          'title': 'discover/movie'
        };
        
        apiUrl = `${BASE_URL}/${endpointMap[sortBy]}`;
        
        if (sortBy === 'title') {
          params.append('sort_by', 'original_title.asc');
        }
      }

      console.log('📡 Запрос к TMDB:', `${apiUrl}?${params}`);
      const response = await fetch(`${apiUrl}?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Форматируем данные
      const formattedMovies = (data.results || []).map(movie => ({
        id: movie.id,
        title: movie.title,
        year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
        rating: movie.vote_average ? movie.vote_average.toFixed(1) : '0.0',
        poster_path: movie.poster_path 
          ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
          : null,
        overview: movie.overview || 'Нет описания',
        genre_ids: movie.genre_ids || [],
        vote_count: movie.vote_count || 0,
        // Генерируем цвет для плейсхолдера на основе ID фильма
        placeholderColor: `hsl(${movie.id % 360}, 70%, 20%)`,
        placeholderLightColor: `hsl(${movie.id % 360}, 70%, 30%)`,
      }));
      
      setMovies(formattedMovies);
      setTotalResults(data.total_results || 0);
      setTotalPages(data.total_pages > 500 ? 500 : (data.total_pages || 1));
      
      console.log(`✅ Загружено ${formattedMovies.length} фильмов`);
      
    } catch (error) {
      console.error('❌ Ошибка загрузки фильмов:', error);
      setMovies([]);
      setTotalResults(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [selectedGenres, selectedYear, selectedRating, sortBy, page, activeFilter]);

  // Загрузка фильмов при изменении параметров
  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  // Годы для фильтров (последние 30 лет)
  const currentYear = new Date().getFullYear();
  const years = ['Все годы', ...Array.from({ length: 30 }, (_, i) => (currentYear - i).toString())];

  // Рейтинги для фильтров
  const ratings = [
    { value: '', label: 'Любой рейтинг' },
    { value: '9', label: '9+' },
    { value: '8', label: '8+' },
    { value: '7', label: '7+' },
    { value: '6', label: '6+' },
    { value: '5', label: '5+' },
  ];

  // Сортировка
  const sortOptions = [
    { value: 'popular', label: 'По популярности' },
    { value: 'rating', label: 'По рейтингу' },
    { value: 'year', label: 'По новизне' },
    { value: 'title', label: 'По названию' },
  ];

  // Обработчики фильтров
  const toggleGenre = (genreId) => {
    if (genreId === 'all') {
      setSelectedGenres([]);
    } else {
      setSelectedGenres(prev => {
        if (prev.includes(genreId)) {
          return prev.filter(id => id !== genreId);
        } else {
          return [...prev, genreId];
        }
      });
    }
    setPage(1);
  };

  const handleYearChange = (year) => {
    setSelectedYear(year === 'Все годы' ? '' : year);
    setPage(1);
  };

  const handleRatingChange = (rating) => {
    setSelectedRating(rating);
    setPage(1);
  };

  const clearAllFilters = () => {
    setSelectedGenres([]);
    setSelectedYear('');
    setSelectedRating('');
    setPage(1);
    // Не сбрасываем activeFilter, чтобы сохранить навигацию из хедера
  };

  // Получить название жанра по ID
  const getGenreName = (genreId) => {
    const genre = genres.find(g => g.id === genreId);
    return genre ? genre.name : `Жанр ${genreId}`;
  };

  // Переход к деталям фильма
  const goToMovieDetails = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  // Пагинация
  const goToPage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setPage(pageNum);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Обработчик ошибки загрузки изображения
  const handleImageError = (e, movieId) => {
    console.error(`❌ Ошибка загрузки изображения для фильма ${movieId}:`, e.target.src);
    e.target.style.display = 'none';
    const placeholder = e.target.parentElement.querySelector('.poster-placeholder');
    if (placeholder) {
      placeholder.style.display = 'flex';
    }
  };

  // Обработчик успешной загрузки изображения
  const handleImageLoad = (e) => {
    e.target.style.display = 'block';
    const placeholder = e.target.parentElement.querySelector('.poster-placeholder');
    if (placeholder) {
      placeholder.style.display = 'none';
    }
  };

  // Генерация страниц для пагинации
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, page - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);
      
      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages) {
        if (end < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (loading && movies.length === 0) {
    return (
      <div className="catalog-page">
        <Header />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Загрузка фильмов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="catalog-page">
      <Header />
      
      <main className="catalog-container">
        <div className="catalog-header">
          <h1 className="catalog-title">{title}</h1>
          <div className="catalog-subtitle">
            {activeFilter === 'new' ? 'Новые фильмы в прокате' : 
             activeFilter === 'popular' ? 'Самые популярные фильмы по рейтингу TMDB' : 
             activeFilter === 'genres' ? 'Фильмы разных жанров' :
             'Все фильмы в нашей базе данных'}
          </div>
          
          <div className="catalog-stats">
            <p>Найдено: <strong>{totalResults.toLocaleString()}</strong> фильмов</p>
            <p>Страница: <strong>{page}</strong> из <strong>{totalPages}</strong></p>
          </div>
          
          <div className="catalog-controls">
            <button 
              className={`filter-toggle ${selectedGenres.length > 0 || selectedYear || selectedRating ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} />
              <span>Фильтры {selectedGenres.length > 0 ? `(${selectedGenres.length})` : ''}</span>
              {showFilters ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            <div className="view-toggle">
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid size={18} />
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <List size={18} />
              </button>
            </div>

            <div className="sort-select">
              <select 
                value={sortBy} 
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="sort-dropdown"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ФИЛЬТРЫ */}
        {showFilters && (
          <div className="filters-panel">
            <div className="filter-section">
              <h3 className="filter-title">Жанры</h3>
              <div className="genre-buttons">
                <button
                  className={`genre-btn ${selectedGenres.length === 0 ? 'active' : ''}`}
                  onClick={() => toggleGenre('all')}
                >
                  Все жанры
                </button>
                {genres.map(genre => (
                  <button
                    key={genre.id}
                    className={`genre-btn ${selectedGenres.includes(genre.id) ? 'active' : ''}`}
                    onClick={() => toggleGenre(genre.id)}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-row">
              <div className="filter-group">
                <h3 className="filter-title">Год выпуска</h3>
                <select 
                  value={selectedYear || 'Все годы'} 
                  onChange={(e) => handleYearChange(e.target.value)}
                  className="filter-select"
                >
                  {years.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <h3 className="filter-title">Рейтинг TMDB</h3>
                <select 
                  value={selectedRating || ''} 
                  onChange={(e) => handleRatingChange(e.target.value)}
                  className="filter-select"
                >
                  {ratings.map(rating => (
                    <option key={rating.value || 'all'} value={rating.value}>
                      {rating.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="filter-actions">
              <button 
                className="apply-filters" 
                onClick={() => setShowFilters(false)}
              >
                Применить фильтры
              </button>
              <button 
                className="reset-filters"
                onClick={clearAllFilters}
              >
                Сбросить все
              </button>
            </div>
          </div>
        )}

        {/* Активные фильтры */}
        {(selectedGenres.length > 0 || selectedYear || selectedRating) && (
          <div className="active-filters">
            <h4>Активные фильтры:</h4>
            <div className="active-filters-list">
              {selectedGenres.map(genreId => (
                <span key={genreId} className="active-filter-tag">
                  {getGenreName(genreId)}
                  <button onClick={() => toggleGenre(genreId)}>×</button>
                </span>
              ))}
              {selectedYear && (
                <span className="active-filter-tag">
                  Год: {selectedYear}
                  <button onClick={() => setSelectedYear('')}>×</button>
                </span>
              )}
              {selectedRating && (
                <span className="active-filter-tag">
                  Рейтинг: {selectedRating}+
                  <button onClick={() => setSelectedRating('')}>×</button>
                </span>
              )}
              {(selectedGenres.length > 0 || selectedYear || selectedRating) && (
                <button 
                  onClick={clearAllFilters}
                  className="clear-all-filters"
                >
                  Очистить все
                </button>
              )}
            </div>
          </div>
        )}

        {/* ФИЛЬМЫ */}
        <div className={`movies-${viewMode}`}>
          {movies.length > 0 ? (
            movies.map(movie => (
              <div 
                key={movie.id} 
                className={`movie-card ${viewMode}`}
                onClick={() => goToMovieDetails(movie.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="movie-poster">
                  {/* Плейсхолдер - скрыт изначально, показывается только при ошибке */}
                  <div 
                    className="poster-placeholder"
                    style={{
                      background: `linear-gradient(135deg, ${movie.placeholderColor} 0%, ${movie.placeholderLightColor} 100%)`,
                      display: movie.poster_path ? 'none' : 'flex'
                    }}
                  >
                    <Film size={40} className="placeholder-icon" />
                    <span className="movie-title-short">{movie.title.substring(0, 20)}{movie.title.length > 20 ? '...' : ''}</span>
                  </div>
                  
                  {/* Изображение - показывается если есть URL */}
                  {movie.poster_path ? (
                    <img 
                      src={movie.poster_path}
                      alt={movie.title}
                      className="poster-image"
                      loading="lazy"
                      onError={(e) => handleImageError(e, movie.id)}
                      onLoad={handleImageLoad}
                    />
                  ) : null}
                  
                  <div className="movie-rating">
                    <Star size={12} />
                    <span>{movie.rating}</span>
                  </div>
                </div>
                
                <div className="movie-info">
                  <h3 className="movie-title">{movie.title}</h3>
                  
                  <div className="movie-meta">
                    <span className="movie-year">
                      <Calendar size={12} />
                      {movie.year}
                    </span>
                    <span className="movie-rating-text">
                      ⭐ {movie.rating} {movie.vote_count > 0 ? `(${movie.vote_count})` : ''}
                    </span>
                  </div>

                  {/* ЖАНРЫ ФИЛЬМА */}
                  <div className="movie-genres">
                    {movie.genre_ids && movie.genre_ids.slice(0, 2).map(genreId => (
                      <span key={genreId} className="genre-tag">
                        {getGenreName(genreId)}
                      </span>
                    ))}
                    {movie.genre_ids && movie.genre_ids.length > 2 && (
                      <span className="genre-tag">+{movie.genre_ids.length - 2}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <h3>Фильмы не найдены</h3>
              <p>Попробуйте изменить параметры поиска или сбросить фильтры</p>
              <button 
                onClick={clearAllFilters}
                className="reset-search-btn"
              >
                Сбросить фильтры
              </button>
            </div>
          )}
        </div>

        {/* ПАГИНАЦИЯ */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              className={`page-btn ${page === 1 ? 'disabled' : ''}`}
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
            >
              ‹ Назад
            </button>
            
            <div className="page-numbers">
              {renderPageNumbers().map((pageNum, index) => (
                pageNum === '...' ? (
                  <span key={`dots-${index}`} className="page-dots">...</span>
                ) : (
                  <button
                    key={pageNum}
                    className={`page-btn ${page === pageNum ? 'active' : ''}`}
                    onClick={() => goToPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                )
              ))}
            </div>
            
            <button 
              className={`page-btn ${page === totalPages ? 'disabled' : ''}`}
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
            >
              Далее ›
            </button>
          </div>
        )}
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">FilmLib</div>
          <div className="footer-links">
            <Link to="/about">О проекте</Link>
            <Link to="/rules">Правила</Link>
            <Link to="/contact">Контакты</Link>
            <Link to="/api">API</Link>
          </div>
          <div className="footer-copyright">
            © {new Date().getFullYear()} FilmLib. Данные предоставлены TMDB.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default CatalogPage;