// 📁 src/pages/SearchPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import Header from "../../components/Header";
import './SearchPage.css';

function SearchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    if (location.state?.searchResults) {
      setResults(location.state.searchResults);
      setQuery(location.state.query || '');
      setSearchInput(location.state.query || '');
    } else if (location.state?.query) {
      setQuery(location.state.query);
      setSearchInput(location.state.query);
      performSearch(location.state.query);
    }
  }, [location]);

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setQuery(searchQuery);
    
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=7b9bc40c52751435482a34432b154abb&language=ru-RU&query=${encodeURIComponent(searchQuery)}&page=1`
      );
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      performSearch(searchInput);
    }
  };

  return (
    <div className="search-page">
      <Header />
      
      <div className="search-container">
        <div className="search-header">
          <form onSubmit={handleSearch} className="search-box">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Введите название фильма..."
              className="search-input"
            />
            <button type="submit" className="search-button">Поиск</button>
          </form>
          
          {query && (
            <>
              <h1 className="search-title">Результаты поиска: "{query}"</h1>
              <p className="search-count">Найдено: {results.length} фильмов</p>
            </>
          )}
        </div>

        {loading ? (
          <div className="loading">Загрузка...</div>
        ) : results.length > 0 ? (
          <div className="movies-grid">
            {results.map(movie => (
              <Link to={`/movie/${movie.id}`} key={movie.id} className="movie-card">
                <div className="movie-poster">
                  {movie.poster_path ? (
                    <img 
                      src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`} 
                      alt={movie.title}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: '#222',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#555',
                      fontSize: '20px'
                    }}>
                      {movie.title?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                <div className="movie-info">
                  <h3 className="movie-title">{movie.title}</h3>
                  <div className="movie-details">
                    <span>{movie.release_date?.split('-')[0] || 'N/A'}</span>
                    <span> • </span>
                    <span className="movie-rating">⭐ {movie.vote_average?.toFixed(1) || 'N/A'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : query ? (
          <div className="no-results">Ничего не найдено</div>
        ) : null}
      </div>
    </div>
  );
}

export default SearchPage;