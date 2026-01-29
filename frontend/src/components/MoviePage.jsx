// src/pages/MoviePage.jsx - С ЛИЧНОЙ КОЛЛЕКЦИЕЙ ПОЛЬЗОВАТЕЛЯ
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import './MoviePage.css';
import { 
  Star, Clock, Calendar, Users, Play, Bookmark, Heart, 
  Share2, Film, Globe, Award, Tag, ChevronLeft, Plus,
  Check, X, FolderPlus, Trash2, ChevronDown
} from 'lucide-react';

function MoviePage() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [credits, setCredits] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
  
  // Состояния для коллекций
  const [userCollections, setUserCollections] = useState([]);
  const [showCollectionsDropdown, setShowCollectionsDropdown] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [selectedCollections, setSelectedCollections] = useState([]);
  
  const collectionsRef = useRef(null);

  const API_KEY = '7b9bc40c52751435482a34432b154abb';
  const BASE_URL = 'https://api.themoviedb.org/3';

  // Закрытие выпадающего списка при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (collectionsRef.current && !collectionsRef.current.contains(event.target)) {
        setShowCollectionsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Загрузка коллекций пользователя из localStorage
  useEffect(() => {
    const loadUserCollections = () => {
      try {
        const collectionsData = localStorage.getItem('userCollections');
        if (collectionsData) {
          const collections = JSON.parse(collectionsData);
          setUserCollections(collections);
          
          // Проверяем, в каких коллекциях уже есть этот фильм
          const movieCollections = collections
            .filter(collection => collection.movies?.includes(parseInt(id)))
            .map(collection => collection.id);
          setSelectedCollections(movieCollections);
        } else {
          // Создаем начальные коллекции, если их нет
          const defaultCollections = [
            { id: 1, name: 'Любимые фильмы', emoji: '❤️', movies: [], createdAt: new Date().toISOString() },
            { id: 2, name: 'Посмотреть позже', emoji: '⏰', movies: [], createdAt: new Date().toISOString() },
            { id: 3, name: 'Лучшее', emoji: '🏆', movies: [], createdAt: new Date().toISOString() },
            { id: 4, name: 'Рекомендую', emoji: '⭐', movies: [], createdAt: new Date().toISOString() }
          ];
          localStorage.setItem('userCollections', JSON.stringify(defaultCollections));
          setUserCollections(defaultCollections);
        }
      } catch (error) {
        console.error('Ошибка загрузки коллекций:', error);
        setUserCollections([]);
      }
    };

    loadUserCollections();
  }, [id]);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        setError(null);

        const movieResponse = await fetch(
          `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=ru-RU&append_to_response=credits`
        );
        
        if (!movieResponse.ok) {
          throw new Error('Фильм не найден');
        }
        
        const movieData = await movieResponse.json();

        const similarResponse = await fetch(
          `${BASE_URL}/movie/${id}/similar?api_key=${API_KEY}&language=ru-RU&page=1`
        );
        const similarData = await similarResponse.json();

        const videosResponse = await fetch(
          `${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}&language=ru-RU`
        );
        const videosData = await videosResponse.json();

        const formattedMovie = {
          id: movieData.id,
          title: movieData.title || movieData.original_title,
          originalTitle: movieData.original_title,
          year: movieData.release_date ? movieData.release_date.split('-')[0] : 'N/A',
          rating: movieData.vote_average ? movieData.vote_average.toFixed(1) : 'N/A',
          votes: movieData.vote_count || 0,
          duration: movieData.runtime || 0,
          ageRating: movieData.adult ? '18+' : '16+',
          description: movieData.overview || 'Описание отсутствует',
          genres: movieData.genres?.map(genre => genre.name) || [],
          countries: movieData.production_countries?.map(country => country.name) || [],
          director: movieData.credits?.crew?.find(person => person.job === 'Director')?.name || 'Неизвестно',
          writers: movieData.credits?.crew
            ?.filter(person => ['Writer', 'Screenplay', 'Author'].includes(person.job))
            ?.map(person => person.name)
            .slice(0, 3) || ['Неизвестно'],
          actors: movieData.credits?.cast?.slice(0, 12).map(actor => ({
            name: actor.name,
            character: actor.character,
            profile_path: actor.profile_path
          })) || [],
          budget: movieData.budget ? `$${(movieData.budget / 1000000).toFixed(1)} млн` : 'Неизвестно',
          boxOffice: movieData.revenue ? `$${(movieData.revenue / 1000000).toFixed(1)} млн` : 'Неизвестно',
          tags: movieData.keywords?.keywords?.map(keyword => keyword.name) || 
                movieData.keywords?.results?.map(keyword => keyword.name) || 
                [],
          trailers: videosData.results?.filter(video => video.type === 'Trailer') || [],
          poster: movieData.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}`
            : null,
          backdrop: movieData.backdrop_path
            ? `https://image.tmdb.org/t/p/original${movieData.backdrop_path}`
            : null,
          production_companies: movieData.production_companies?.map(company => company.name) || [],
          status: movieData.status || 'Неизвестно',
          original_language: movieData.original_language || 'en'
        };

        const formattedSimilar = similarData.results?.slice(0, 6).map(movie => ({
          id: movie.id,
          title: movie.title,
          year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
          rating: movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A',
          poster: movie.poster_path 
            ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
            : null
        })) || [];

        setMovie(formattedMovie);
        setCredits(movieData.credits);
        setSimilarMovies(formattedSimilar);
        
      } catch (err) {
        console.error('❌ Ошибка загрузки фильма:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [id]);

  // Функции для работы с коллекциями
  const toggleCollectionSelection = (collectionId) => {
    setSelectedCollections(prev => {
      if (prev.includes(collectionId)) {
        return prev.filter(id => id !== collectionId);
      } else {
        return [...prev, collectionId];
      }
    });
  };

  const saveToCollections = () => {
    try {
      const updatedCollections = userCollections.map(collection => {
        if (selectedCollections.includes(collection.id)) {
          // Добавляем фильм, если его еще нет
          if (!collection.movies.includes(parseInt(id))) {
            return {
              ...collection,
              movies: [...collection.movies, parseInt(id)],
              updatedAt: new Date().toISOString()
            };
          }
        } else {
          // Удаляем фильм, если он есть
          return {
            ...collection,
            movies: collection.movies.filter(movieId => movieId !== parseInt(id)),
            updatedAt: new Date().toISOString()
          };
        }
        return collection;
      });

      localStorage.setItem('userCollections', JSON.stringify(updatedCollections));
      setUserCollections(updatedCollections);
      setShowCollectionsDropdown(false);
      
      // Показываем уведомление
      const addedTo = updatedCollections.filter(c => 
        c.movies.includes(parseInt(id)) && selectedCollections.includes(c.id)
      ).map(c => c.name);
      
      if (addedTo.length > 0) {
        alert(`Фильм добавлен в: ${addedTo.join(', ')}`);
      } else {
        alert('Фильм удален из коллекций');
      }
    } catch (error) {
      console.error('Ошибка сохранения коллекций:', error);
      alert('Ошибка сохранения');
    }
  };

  const createNewCollection = () => {
    if (!newCollectionName.trim()) {
      alert('Введите название коллекции');
      return;
    }

    const newCollection = {
      id: Date.now(),
      name: newCollectionName,
      emoji: '📁',
      movies: [parseInt(id)],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedCollections = [...userCollections, newCollection];
    localStorage.setItem('userCollections', JSON.stringify(updatedCollections));
    setUserCollections(updatedCollections);
    setSelectedCollections([...selectedCollections, newCollection.id]);
    setNewCollectionName('');
    setShowCreateModal(false);
  };

  const deleteCollection = (collectionId, e) => {
    e.stopPropagation();
    if (window.confirm('Удалить коллекцию?')) {
      const updatedCollections = userCollections.filter(c => c.id !== collectionId);
      localStorage.setItem('userCollections', JSON.stringify(updatedCollections));
      setUserCollections(updatedCollections);
      setSelectedCollections(selectedCollections.filter(id => id !== collectionId));
    }
  };

  // Проверка, есть ли фильм в "Любимых"
  const isInFavorites = userCollections.some(c => 
    c.name === 'Любимые фильмы' && c.movies?.includes(parseInt(id))
  );

  const toggleFavorite = () => {
    const favoritesCollection = userCollections.find(c => c.name === 'Любимые фильмы');
    if (!favoritesCollection) return;

    const updatedCollections = userCollections.map(collection => {
      if (collection.id === favoritesCollection.id) {
        if (collection.movies.includes(parseInt(id))) {
          // Удаляем из любимых
          return {
            ...collection,
            movies: collection.movies.filter(movieId => movieId !== parseInt(id)),
            updatedAt: new Date().toISOString()
          };
        } else {
          // Добавляем в любимые
          return {
            ...collection,
            movies: [...collection.movies, parseInt(id)],
            updatedAt: new Date().toISOString()
          };
        }
      }
      return collection;
    });

    localStorage.setItem('userCollections', JSON.stringify(updatedCollections));
    setUserCollections(updatedCollections);
    
    // Обновляем selectedCollections
    if (favoritesCollection.movies.includes(parseInt(id))) {
      setSelectedCollections(selectedCollections.filter(id => id !== favoritesCollection.id));
    } else {
      setSelectedCollections([...selectedCollections, favoritesCollection.id]);
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}ч ${mins}м` : `${mins}м`;
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <div className="movie-page loading">
        <Header />
        <div className="loading-container">
          <div className="loader">Загрузка фильма...</div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="movie-page">
        <Header />
        <div className="not-found">
          <h2>Фильм не найден</h2>
          <p>{error || 'Произошла ошибка при загрузке фильма'}</p>
          <Link to="/" className="btn-back">Вернуться на главную</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="movie-page">
      <Header />
      
      {/* Задний фон с постером фильма */}
      <div 
        className="movie-backdrop"
        style={{
          backgroundImage: movie.backdrop 
            ? `url(${movie.backdrop})`
            : 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)'
        }}
      >
        <div className="backdrop-overlay"></div>
      </div>

      <main className="movie-container">
        {/* Кнопка назад */}
        <Link to="/" className="back-button">
          <ChevronLeft size={20} />
          <span>Назад</span>
        </Link>

        {/* Основная информация */}
        <div className="movie-header">
          <div className="movie-poster-large">
            <div className="poster-wrapper">
              {movie.poster ? (
                <img 
                  src={movie.poster} 
                  alt={movie.title}
                  className="poster-image-large"
                  loading="lazy"
                />
              ) : (
                <div className="poster-placeholder-large">
                  {movie.title.charAt(0)}
                </div>
              )}
              {movie.trailers.length > 0 && (
                <button 
                  className="play-trailer-btn"
                  onClick={() => window.open(`https://www.youtube.com/watch?v=${movie.trailers[0].key}`, '_blank')}
                >
                  <Play size={24} />
                  <span>Трейлер</span>
                </button>
              )}
            </div>
          </div>

          <div className="movie-header-info">
            <div className="title-section">
              <h1 className="movie-title">{movie.title}</h1>
              {movie.originalTitle && movie.originalTitle !== movie.title && (
                <h2 className="movie-original-title">{movie.originalTitle}</h2>
              )}
              
              <div className="movie-badges">
                <div className="badge rating-badge">
                  <Star size={16} />
                  <span>{movie.rating}</span>
                  <span className="votes">({formatNumber(movie.votes)})</span>
                </div>
                <div className="badge year-badge">
                  <Calendar size={14} />
                  <span>{movie.year}</span>
                </div>
                <div className="badge duration-badge">
                  <Clock size={14} />
                  <span>{formatDuration(movie.duration)}</span>
                </div>
                <div className="badge age-badge">{movie.ageRating}</div>
                {movie.status && (
                  <div className="badge status-badge">{movie.status}</div>
                )}
              </div>
            </div>

            {/* Быстрые действия */}
            <div className="quick-actions">
              <button 
                className={`action-btn ${isInFavorites ? 'active' : ''}`}
                onClick={toggleFavorite}
              >
                <Heart size={20} />
                <span>{isInFavorites ? 'В любимых' : 'В любимые'}</span>
              </button>
              
              <div className="collections-dropdown-container" ref={collectionsRef}>
                <button 
                  className="action-btn collections-dropdown-btn"
                  onClick={() => setShowCollectionsDropdown(!showCollectionsDropdown)}
                >
                  <FolderPlus size={20} />
                  <span>В коллекцию</span>
                  <ChevronDown size={16} />
                </button>
                
                {showCollectionsDropdown && (
                  <div className="collections-dropdown">
                    <div className="dropdown-header">
                      <h4>Добавить в коллекцию</h4>
                      <button 
                        className="close-dropdown"
                        onClick={() => setShowCollectionsDropdown(false)}
                      >
                        <X size={20} />
                      </button>
                    </div>
                    
                    <div className="collections-list-dropdown">
                      {userCollections.map(collection => (
                        <div 
                          key={collection.id}
                          className={`collection-item-dropdown ${selectedCollections.includes(collection.id) ? 'selected' : ''}`}
                          onClick={() => toggleCollectionSelection(collection.id)}
                        >
                          <div className="collection-info-dropdown">
                            <span className="collection-emoji-dropdown">{collection.emoji}</span>
                            <div>
                              <h5>{collection.name}</h5>
                              <p>{collection.movies?.length || 0} фильмов</p>
                            </div>
                          </div>
                          {selectedCollections.includes(collection.id) ? (
                            <Check size={20} className="selected-icon-dropdown" />
                          ) : (
                            <div className="unselected-circle-dropdown"></div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="dropdown-footer">
                      <button 
                        className="btn-create-new"
                        onClick={() => setShowCreateModal(true)}
                      >
                        <Plus size={16} />
                        <span>Создать коллекцию</span>
                      </button>
                      <button 
                        className="btn-save-collections"
                        onClick={saveToCollections}
                      >
                        Сохранить
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <button 
                className="action-btn"
                onClick={() => navigator.share?.({ 
                  title: movie.title,
                  text: `Смотри ${movie.title} на FilmLib!`,
                  url: window.location.href 
                })}
              >
                <Share2 size={20} />
                <span>Поделиться</span>
              </button>
            </div>

            {/* Модальное окно создания коллекции */}
            {showCreateModal && (
              <div className="create-collection-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Создать коллекцию</h3>
                  <button 
                    className="close-modal"
                    onClick={() => setShowCreateModal(false)}
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div className="modal-body">
                  <div className="form-group">
                    <label>Название коллекции</label>
                    <input
                      type="text"
                      value={newCollectionName}
                      onChange={(e) => setNewCollectionName(e.target.value)}
                      placeholder="Например: Любимые комедии"
                      onKeyPress={(e) => e.key === 'Enter' && createNewCollection()}
                      autoFocus
                    />
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button 
                    className="btn-cancel"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Отмена
                  </button>
                  <button 
                    className="btn-create"
                    onClick={createNewCollection}
                  >
                    Создать
                  </button>
                </div>
              </div>
            )}

            {/* Быстрый просмотр коллекций */}
            <div className="quick-collections-preview">
              <h4>В ваших коллекциях:</h4>
              <div className="collections-tags">
                {userCollections
                  .filter(c => c.movies?.includes(parseInt(id)))
                  .map(collection => (
                    <span key={collection.id} className="collection-tag">
                      {collection.emoji} {collection.name}
                    </span>
                  ))}
                {userCollections.filter(c => c.movies?.includes(parseInt(id))).length === 0 && (
                  <span className="collection-tag empty">
                    Еще нет в коллекциях
                  </span>
                )}
              </div>
            </div>

            {/* Жанры и страны */}
            <div className="movie-meta">
              <div className="genres-section">
                <h4>Жанры:</h4>
                <div className="genres-list">
                  {movie.genres.map((genre, index) => (
                    <span key={index} className="genre-tag">{genre}</span>
                  ))}
                </div>
              </div>
              
              <div className="countries-section">
                <h4>Страны:</h4>
                <div className="countries-list">
                  {movie.countries.map((country, index) => (
                    <span key={index} className="country-tag">
                      <Globe size={14} />
                      {country}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Дополнительная информация */}
            <div className="additional-info">
              {movie.production_companies.length > 0 && (
                <div className="info-item">
                  <h4>Производство:</h4>
                  <p>{movie.production_companies.slice(0, 3).join(', ')}</p>
                </div>
              )}
              <div className="info-item">
                <h4>Язык оригинала:</h4>
                <p>{movie.original_language.toUpperCase()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Табы с информацией */}
        <div className="movie-tabs">
          <nav className="tabs-nav">
            <button 
              className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
              onClick={() => setActiveTab('about')}
            >
              О фильме
            </button>
            <button 
              className={`tab-btn ${activeTab === 'cast' ? 'active' : ''}`}
              onClick={() => setActiveTab('cast')}
            >
              Актёры ({movie.actors.length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'similar' ? 'active' : ''}`}
              onClick={() => setActiveTab('similar')}
            >
              Похожие
            </button>
          </nav>

          <div className="tabs-content">
            {activeTab === 'about' && (
              <div className="tab-about">
                <h3>Описание</h3>
                <p className="movie-description">{movie.description}</p>
                
                <div className="details-grid">
                  <div className="detail-item">
                    <h4>Режиссер</h4>
                    <p>{movie.director}</p>
                  </div>
                  <div className="detail-item">
                    <h4>Сценаристы</h4>
                    <p>{movie.writers.join(', ') || 'Неизвестно'}</p>
                  </div>
                  <div className="detail-item">
                    <h4>Бюджет</h4>
                    <p>{movie.budget}</p>
                  </div>
                  <div className="detail-item">
                    <h4>Сборы</h4>
                    <p>{movie.boxOffice}</p>
                  </div>
                </div>

                {movie.tags.length > 0 && (
                  <div className="movie-tags-section">
                    <h4>Теги</h4>
                    <div className="tags-list">
                      {movie.tags.slice(0, 10).map((tag, index) => (
                        <span key={index} className="tag">#{tag.replace(/\s+/g, '')}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'cast' && (
              <div className="tab-cast">
                <h3>Актёрский состав</h3>
                <div className="cast-grid">
                  {movie.actors.map((actor, index) => (
                    <div key={index} className="cast-member">
                      <div className="actor-avatar">
                        {actor.profile_path ? (
                          <img 
                            src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                            alt={actor.name}
                            loading="lazy"
                          />
                        ) : (
                          actor.name.charAt(0)
                        )}
                      </div>
                      <div className="actor-info">
                        <h5>{actor.name}</h5>
                        <p>{actor.character || 'Роль не указана'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'similar' && (
              <div className="tab-similar">
                <h3>Похожие фильмы</h3>
                <div className="similar-movies">
                  {similarMovies.map((similar, index) => (
                    <Link 
                      key={index} 
                      to={`/movie/${similar.id}`}
                      className="similar-movie"
                    >
                      {similar.poster ? (
                        <img 
                          src={similar.poster}
                          alt={similar.title}
                          className="similar-poster"
                          loading="lazy"
                        />
                      ) : (
                        <div className="similar-poster placeholder">
                          {similar.title.charAt(0)}
                        </div>
                      )}
                      <div className="similar-info">
                        <h5>{similar.title}</h5>
                        <div className="similar-meta">
                          <span>{similar.year}</span>
                          <span>⭐ {similar.rating}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default MoviePage;