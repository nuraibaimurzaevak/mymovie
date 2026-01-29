// src/pages/HomePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Header from "../../components/Header";
import './HomePage.css';

function HomePage() {
  const [popularMovies, setPopularMovies] = useState([]);
  const [newMovies, setNewMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userCollections, setUserCollections] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  
  const newMoviesRef = useRef(null);
  const popularMoviesRef = useRef(null);

  const MOVIES_PER_SECTION = {
    popular: 5,
    new: 12
  };

  useEffect(() => {
    const handleScrollToSection = () => {
      if (location.hash) {
        setTimeout(() => {
          if (location.hash === '#new' && newMoviesRef.current) {
            newMoviesRef.current.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            });
            window.history.replaceState(null, '', window.location.pathname);
          } else if (location.hash === '#popular' && popularMoviesRef.current) {
            popularMoviesRef.current.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            });
            window.history.replaceState(null, '', window.location.pathname);
          }
        }, 300);
      }
    };

    if (!loading) {
      handleScrollToSection();
    }
  }, [location.hash, loading]);

  useEffect(() => {
    const loadUserCollections = () => {
      try {
        const collectionsData = localStorage.getItem('userCollections');
        if (collectionsData) {
          setUserCollections(JSON.parse(collectionsData));
        }
      } catch (error) {
        console.error('Ошибка загрузки коллекций:', error);
      }
    };

    loadUserCollections();
  }, []);

  useEffect(() => {
    const loadMoviesFromAPI = async () => {
      try {
        console.log('🔗 Загружаю фильмы...');
        
        const popularPromises = [];
        const newPromises = [];
        
        for (let page = 1; page <= 2; page++) {
          popularPromises.push(
            fetch(
              `https://api.themoviedb.org/3/movie/popular?api_key=7b9bc40c52751435482a34432b154abb&language=ru-RU&page=${page}`
            ).then(res => res.json())
          );
        }
        
        for (let page = 1; page <= 2; page++) {
          newPromises.push(
            fetch(
              `https://api.themoviedb.org/3/movie/now_playing?api_key=7b9bc40c52751435482a34432b154abb&language=ru-RU&page=${page}`
            ).then(res => res.json())
          );
        }
        
        const [popularPage1, popularPage2] = await Promise.all(popularPromises);
        const [newPage1, newPage2] = await Promise.all(newPromises);
        
        const allPopularMovies = [
          ...popularPage1.results,
          ...popularPage2.results
        ];
        
        const allNewMovies = [
          ...newPage1.results,
          ...newPage2.results
        ];
        
        const formatMovies = (movies, count) => {
          const uniqueMovies = movies
            .filter((movie, index, self) => 
              index === self.findIndex(m => m.id === movie.id)
            )
            .slice(0, count);
          
          return uniqueMovies.map(movie => ({
            id: movie.id,
            title: movie.title,
            year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
            rating: movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A',
            poster: movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : null,
            overview: movie.overview
          }));
        };
        
        setPopularMovies(formatMovies(allPopularMovies, MOVIES_PER_SECTION.popular));
        setNewMovies(formatMovies(allNewMovies, MOVIES_PER_SECTION.new));
        setLoading(false);
        
        console.log('✅ API загружено:', {
          popular: popularMovies.length,
          new: newMovies.length
        });
        
      } catch (error) {
        console.error('❌ Ошибка API:', error);
        setLoading(false);
      }
    };
    
    loadMoviesFromAPI();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    try {
      console.log('🔍 Ищем фильмы:', searchQuery);
      
      const searchResponse = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=7b9bc40c52751435482a34432b154abb&language=ru-RU&query=${encodeURIComponent(searchQuery)}&page=1`
      );
      
      const searchData = await searchResponse.json();
      console.log('🔍 Найдено фильмов:', searchData.results.length);
      
      navigate('/search', { 
        state: { 
          searchResults: searchData.results,
          query: searchQuery 
        } 
      });
      
    } catch (error) {
      console.error('❌ Ошибка поиска:', error);
      navigate('/search', { state: { query: searchQuery } });
    }
  };

  if (loading) {
    return (
      <div className="home-page">
        <Header />
        <div style={{padding: '50px', textAlign: 'center'}}>
          <div className="spinner"></div>
          <p>Загрузка фильмов ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <Header />
      
      <main className="main-container">
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Фильмы, сериалы и многое другое</h1>
            <p className="hero-subtitle">Миллионы фильмов и сериалов. Исследуйте сейчас.</p>
            
            <form onSubmit={handleSearch} className="hero-search">
              <input 
                type="text" 
                placeholder="Найти фильм, сериал, актера..."
                className="search-input-large"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="search-button-large">Найти</button>
            </form>
          </div>
        </section>

        <section className="sections-grid">
          <h2 className="section-title">Популярные разделы</h2>
          <div className="sections-container">
            <Link to="/collections" className="section-card">
              <div className="section-icon">📚</div>
              <h3>Мои коллекции</h3>
              <p>Ваши личные подборки</p>
            </Link>
            
            <Link 
              to="/catalog" 
              state={{ initialFilter: 'genres' }}
              className="section-card"
            >
              <div className="section-icon">🏷️</div>
              <h3>По жанрам</h3>
              <p>Фильмы вашего любимого жанра</p>
            </Link>
          </div>
        </section>

        <div className="content-grid">
          {/* ЛЕВЫЙ БЛОК - ПОПУЛЯРНЫЕ (столбик) */}
          <div ref={popularMoviesRef} id="popular" className="content-block">
            <div className="block-header">
              <h3>🔥 Сейчас популярно</h3>
              <Link 
                to="/catalog" 
                state={{ initialFilter: 'popular' }}
                className="see-all"
              >
                Все
              </Link>
            </div>
            <div className="movies-list">
              {popularMovies.map(movie => (
                <Link 
                  to={`/movie/${movie.id}`} 
                  key={movie.id} 
                  className="movie-item-link"
                >
                  <div className="movie-item">
                    <div className="movie-poster">
                      {movie.poster ? (
                        <img 
                          src={movie.poster} 
                          alt={movie.title}
                          className="poster-image"
                          loading="lazy"
                        />
                      ) : (
                        <div className="poster-placeholder-small">
                          {movie.title.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="movie-info">
                      <h4>{movie.title}</h4>
                      <div className="movie-meta">
                        <span>{movie.year}</span>
                        <span className="separator">•</span>
                        <span className="rating">⭐ {movie.rating}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ПРАВЫЙ БЛОК - НОВИНКИ (сетка) */}
          <div ref={newMoviesRef} id="new" className="content-block-new">
            <div className="block-header">
              <h3>🆕 Новинки</h3>
              <Link 
                to="/catalog" 
                state={{ initialFilter: 'new' }}
                className="see-all"
              >
                Все 
              </Link>
            </div>
            <div className="new-movies-grid">
              {newMovies.map(movie => (
                <Link 
                  to={`/movie/${movie.id}`} 
                  key={movie.id} 
                  className="new-movie-card"
                >
                  <div className="new-movie-poster">
                    {movie.poster ? (
                      <img 
                        src={movie.poster} 
                        alt={movie.title}
                        className="new-poster-image"
                        loading="lazy"
                      />
                    ) : (
                      <div className="new-poster-placeholder">
                        {movie.title.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="new-movie-info">
                    <h4 className="new-movie-title">{movie.title}</h4>
                    <div className="new-movie-meta">
                      <span className="new-movie-year">{movie.year}</span>
                      <span className="new-movie-rating">⭐ {movie.rating}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
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
            © {new Date().getFullYear()} FilmLib. База данных фильмов.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;