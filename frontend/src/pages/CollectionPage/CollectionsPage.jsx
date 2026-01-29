// src/pages/CollectionsPage.jsx - ЛИЧНЫЕ КОЛЛЕКЦИИ ПОЛЬЗОВАТЕЛЯ
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import './CollectionsPage.css';
import { 
  Folder, Plus, Trash2, Edit3, Film, Star, Calendar, 
  ChevronRight, Grid, List, Search, X
} from 'lucide-react';

function CollectionsPage() {
  const [userCollections, setUserCollections] = useState([]);
  const [moviesData, setMoviesData] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionEmoji, setNewCollectionEmoji] = useState('📁');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  
  const API_KEY = '7b9bc40c52751435482a34432b154abb';
  const BASE_URL = 'https://api.themoviedb.org/3';

  const popularEmojis = [
    '📁', '❤️', '⭐', '🏆', '🎬', '🍿', '🎞️', '📽️', '🎥', '🎭', 
    '✨', '📚', '🎨', '🎵', '🎮', '🔥', '💎', '🎯', '💖', '🌟'
  ];

  // Загрузка коллекций из localStorage
  useEffect(() => {
    const loadCollections = () => {
      try {
        const collectionsData = localStorage.getItem('userCollections');
        if (collectionsData) {
          const collections = JSON.parse(collectionsData);
          setUserCollections(collections);
          
          if (collections.length > 0 && !selectedCollection) {
            setSelectedCollection(collections[0]);
          }
        }
      } catch (error) {
        console.error('Ошибка загрузки коллекций:', error);
      }
    };

    loadCollections();
  }, []);

  // Загрузка данных о фильмах для выбранной коллекции
  useEffect(() => {
    const loadMoviesForCollection = async () => {
      if (!selectedCollection || selectedCollection.movies.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const moviesPromises = selectedCollection.movies.map(async (movieId) => {
          try {
            const response = await fetch(
              `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=ru-RU`
            );
            
            if (!response.ok) {
              console.warn(`Фильм ${movieId} не найден в TMDB`);
              return {
                id: movieId,
                title: `Фильм ${movieId}`,
                year: 'N/A',
                rating: 'N/A',
                poster: null,
                overview: 'Данные не найдены'
              };
            }
            
            const movieData = await response.json();
            
            return {
              id: movieData.id,
              title: movieData.title || movieData.original_title,
              year: movieData.release_date ? movieData.release_date.split('-')[0] : 'N/A',
              rating: movieData.vote_average ? movieData.vote_average.toFixed(1) : 'N/A',
              poster: movieData.poster_path 
                ? `https://image.tmdb.org/t/p/w300${movieData.poster_path}`
                : null,
              overview: movieData.overview || 'Нет описания',
              backdrop: movieData.backdrop_path 
                ? `https://image.tmdb.org/t/p/w500${movieData.backdrop_path}`
                : null,
              genres: movieData.genres?.map(g => g.name) || []
            };
          } catch (error) {
            console.error(`Ошибка загрузки фильма ${movieId}:`, error);
            return {
              id: movieId,
              title: `Фильм ${movieId}`,
              year: 'N/A',
              rating: 'N/A',
              poster: null,
              overview: 'Ошибка загрузки'
            };
          }
        });

        const movies = await Promise.all(moviesPromises);
        setMoviesData(prev => ({
          ...prev,
          [selectedCollection.id]: movies
        }));
      } catch (error) {
        console.error('Ошибка загрузки фильмов коллекции:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMoviesForCollection();
  }, [selectedCollection]);

  // Создание новой коллекции
  const createNewCollection = () => {
    if (!newCollectionName.trim()) {
      alert('Введите название коллекции');
      return;
    }

    const newCollection = {
      id: Date.now(),
      name: newCollectionName,
      emoji: newCollectionEmoji,
      movies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedCollections = [...userCollections, newCollection];
    localStorage.setItem('userCollections', JSON.stringify(updatedCollections));
    setUserCollections(updatedCollections);
    setSelectedCollection(newCollection);
    setNewCollectionName('');
    setNewCollectionEmoji('📁');
    setShowCreateModal(false);
  };

  // Удаление коллекции
  const deleteCollection = (collectionId) => {
    if (!window.confirm('Удалить коллекцию? Все фильмы в ней будут удалены.')) {
      return;
    }

    const updatedCollections = userCollections.filter(c => c.id !== collectionId);
    localStorage.setItem('userCollections', JSON.stringify(updatedCollections));
    setUserCollections(updatedCollections);
    
    if (selectedCollection?.id === collectionId) {
      setSelectedCollection(updatedCollections[0] || null);
    }
  };

  // Удаление фильма из коллекции
  const removeMovieFromCollection = (movieId, e) => {
    e.stopPropagation();
    if (!window.confirm('Удалить фильм из коллекции?')) {
      return;
    }

    const updatedCollections = userCollections.map(collection => {
      if (collection.id === selectedCollection.id) {
        return {
          ...collection,
          movies: collection.movies.filter(id => id !== movieId),
          updatedAt: new Date().toISOString()
        };
      }
      return collection;
    });

    localStorage.setItem('userCollections', JSON.stringify(updatedCollections));
    setUserCollections(updatedCollections);
    
    setMoviesData(prev => ({
      ...prev,
      [selectedCollection.id]: prev[selectedCollection.id]?.filter(m => m.id !== movieId) || []
    }));

    setSelectedCollection(updatedCollections.find(c => c.id === selectedCollection.id));
  };

  // Редактирование названия коллекции
  const updateCollectionName = (collectionId, newName) => {
    if (!newName.trim()) {
      alert('Введите название коллекции');
      return;
    }

    const updatedCollections = userCollections.map(collection => {
      if (collection.id === collectionId) {
        return {
          ...collection,
          name: newName,
          updatedAt: new Date().toISOString()
        };
      }
      return collection;
    });

    localStorage.setItem('userCollections', JSON.stringify(updatedCollections));
    setUserCollections(updatedCollections);
    
    if (selectedCollection?.id === collectionId) {
      setSelectedCollection(updatedCollections.find(c => c.id === collectionId));
    }
    
    setEditingCollection(null);
  };

  // Фильтрация коллекций по поиску
  const filteredCollections = userCollections.filter(collection =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Фильмы текущей выбранной коллекции
  const currentMovies = selectedCollection ? moviesData[selectedCollection.id] || [] : [];

  // Подсчет общего количества фильмов во всех коллекциях
  const totalMoviesCount = userCollections.reduce((sum, collection) => 
    sum + (collection.movies?.length || 0), 0
  );

  if (userCollections.length === 0) {
    return (
      <div className="collections-page">
        <Header />
        
        <main className="collections-container">
          <div className="collections-header">
            <h1 className="collections-title">Мои коллекции</h1>
            <p className="collections-subtitle">Создавайте личные подборки фильмов</p>
          </div>

          <div className="empty-collections">
            <div className="empty-icon">
              <Folder size={80} />
            </div>
            <h3>У вас еще нет коллекций</h3>
            <p>Создайте свою первую коллекцию и добавляйте в нее любимые фильмы</p>
            
            <button 
              className="btn-create-first-collection"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={20} />
              <span>Создать коллекцию</span>
            </button>
          </div>
        </main>

        {/* Модальное окно создания коллекции */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="create-collection-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Создать коллекцию</h3>
                <button 
                  className="close-modal"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewCollectionEmoji('📁');
                  }}
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
                
                <div className="form-group">
                  <label>Выберите иконку:</label>
                  <div className="emoji-selection">
                    <div className="emoji-buttons">
                      {popularEmojis.map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          className={`emoji-btn ${newCollectionEmoji === emoji ? 'selected' : ''}`}
                          onClick={() => setNewCollectionEmoji(emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                    <div className="selected-emoji">
                      <span>Выбрано: </span>
                      <span className="emoji-preview">{newCollectionEmoji}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  className="btn-cancel"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewCollectionEmoji('📁');
                  }}
                >
                  Отмена
                </button>
                <button 
                  className="btn-create"
                  onClick={createNewCollection}
                >
                  Создать коллекцию
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="collections-page">
      <Header />
      
      <main className="collections-container">
        <div className="collections-header">
          <h1 className="collections-title">Мои коллекции</h1>
          <div className="collections-stats">
            <span>{userCollections.length} коллекций</span>
            <span>•</span>
            <span>{totalMoviesCount} фильмов</span>
          </div>
        </div>

        {/* Панель поиска и управления */}
        <div className="collections-controls">
          <div className="search-bar">
            <Search size={20} />
            <input
              type="text"
              placeholder="Поиск по коллекциям..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="btn-clear-search"
                onClick={() => setSearchQuery('')}
                aria-label="Очистить поиск"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="view-toggle">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Сетка"
            >
              <Grid size={18} />
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              aria-label="Список"
            >
              <List size={18} />
            </button>
          </div>

          <button 
            className="btn-create-collection"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={18} />
            <span>Новая коллекция</span>
          </button>
        </div>

        <div className="collections-layout">
          {/* Список коллекций слева */}
          <div className="collections-sidebar">
            <h3 className="sidebar-title">Все коллекции</h3>
            
            <div className="collections-list">
              {filteredCollections.map(collection => (
                <div 
                  key={collection.id}
                  className={`collection-item-sidebar ${
                    selectedCollection?.id === collection.id ? 'active' : ''
                  }`}
                  onClick={() => setSelectedCollection(collection)}
                >
                  <div className="collection-info-sidebar">
                    <span className="collection-emoji">{collection.emoji || '📁'}</span>
                    
                    {editingCollection === collection.id ? (
                      <input
                        type="text"
                        defaultValue={collection.name}
                        onBlur={(e) => updateCollectionName(collection.id, e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            updateCollectionName(collection.id, e.target.value);
                          }
                        }}
                        autoFocus
                        className="edit-collection-input"
                      />
                    ) : (
                      <div className="collection-details">
                        <h4>{collection.name}</h4>
                        <p>{collection.movies?.length || 0} фильмов</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="collection-actions-sidebar">
                    <button 
                      className="edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCollection(collection.id);
                      }}
                      title="Редактировать название"
                      aria-label="Редактировать"
                    >
                      <Edit3 size={14} />
                    </button>
                    
                    <button 
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCollection(collection.id);
                      }}
                      title="Удалить коллекцию"
                      aria-label="Удалить"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Содержимое выбранной коллекции справа */}
          <div className="collection-content">
            {selectedCollection ? (
              <>
                <div className="collection-header">
                  <div className="collection-title-section">
                    <h2>
                      <span className="collection-emoji-large">{selectedCollection.emoji || '📁'}</span>
                      {selectedCollection.name}
                    </h2>
                    <div className="collection-meta">
                      <span className="movie-count">
                        <Film size={16} />
                        {selectedCollection.movies?.length || 0} фильмов
                      </span>
                      <span className="created-date">
                        <Calendar size={16} />
                        Создано: {new Date(selectedCollection.createdAt).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="collection-actions">
                    <button 
                      className="btn-edit-collection"
                      onClick={() => setEditingCollection(selectedCollection.id)}
                    >
                      <Edit3 size={16} />
                      <span>Редактировать</span>
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="loading-movies">
                    <div className="spinner"></div>
                    <p>Загрузка фильмов...</p>
                  </div>
                ) : currentMovies.length > 0 ? (
                  <div className={`movies-${viewMode}`}>
                    {currentMovies.map(movie => (
                      <div key={movie.id} className="movie-card-collection">
                        <Link 
                          to={`/movie/${movie.id}`}
                          className="movie-card-link"
                        >
                          <div className="movie-poster-collection">
                            {movie.poster ? (
                              <img 
                                src={movie.poster}
                                alt={movie.title}
                                className="poster-image-collection"
                                loading="lazy"
                              />
                            ) : (
                              <div className="poster-placeholder-collection">
                                <Film size={30} />
                                <span>{movie.title.charAt(0)}</span>
                              </div>
                            )}
                            
                            <div className="movie-rating-collection">
                              <Star size={12} />
                              <span>{movie.rating}</span>
                            </div>
                          </div>
                          
                          <div className="movie-info-collection">
                            <h3 className="movie-title-collection">{movie.title}</h3>
                            
                            <div className="movie-meta-collection">
                              <span className="movie-year">
                                <Calendar size={12} />
                                {movie.year}
                              </span>
                              <span className="movie-rating-text">
                                ⭐ {movie.rating}
                              </span>
                            </div>
                            
                            {movie.genres && movie.genres.length > 0 && (
                              <div className="movie-genres-collection">
                                {movie.genres.slice(0, 2).map((genre, index) => (
                                  <span key={index} className="genre-tag-collection">
                                    {genre}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </Link>
                        
                        <button 
                          className="btn-remove-from-collection"
                          onClick={(e) => removeMovieFromCollection(movie.id, e)}
                          title="Удалить из коллекции"
                          aria-label="Удалить из коллекции"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-collection">
                    <div className="empty-collection-icon">
                      <Film size={60} />
                    </div>
                    <h3>Коллекция пуста</h3>
                    <p>Добавляйте фильмы в эту коллекцию на страницах фильмов</p>
                    <Link to="/" className="btn-browse-movies">
                      <ChevronRight size={16} />
                      <span>Перейти к фильмам</span>
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <div className="select-collection-message">
                <h3>Выберите коллекцию</h3>
                <p>Выберите коллекцию из списка слева, чтобы увидеть её содержимое</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Модальное окно создания коллекции */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="create-collection-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Создать коллекцию</h3>
              <button 
                className="close-modal"
                onClick={() => {
                  setShowCreateModal(false);
                  setNewCollectionEmoji('📁');
                }}
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
              
              <div className="form-group">
                <label>Выберите иконку:</label>
                <div className="emoji-selection">
                  <div className="emoji-buttons">
                    {popularEmojis.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        className={`emoji-btn ${newCollectionEmoji === emoji ? 'selected' : ''}`}
                        onClick={() => setNewCollectionEmoji(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <div className="selected-emoji">
                    <span>Выбрано: </span>
                    <span className="emoji-preview">{newCollectionEmoji}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-cancel"
                onClick={() => {
                  setShowCreateModal(false);
                  setNewCollectionEmoji('📁');
                }}
              >
                Отмена
              </button>
              <button 
                className="btn-create"
                onClick={createNewCollection}
              >
                Создать коллекцию
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CollectionsPage;