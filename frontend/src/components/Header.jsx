// src/components/Header.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import { User, Menu, X } from 'lucide-react';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  // ПРОВЕРКА АВТОРИЗАЦИИ
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setIsLoggedIn(true);
        setUserName(user.name || user.email.split('@')[0] || 'User');
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const navLinks = [
    { name: 'Главная', href: '/' },
    { name: 'Каталог', href: '/catalog' },
    { 
      name: 'Новинки', 
      href: '/#new'
    },
    { 
      name: 'Популярное', 
      href: '/#popular'
    },
    { name: 'Коллекции', href: '/collections' },
  ];

  const handleAuthClick = () => {
    if (isLoggedIn) {
      navigate('/profile');
    } else {
      navigate('/login');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserName('');
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-top">
          <div className="logo-container">
            <div className="logo-icon">F</div>
            <div className="logo-text">
              <h1 className="logo-title">Flicklib</h1>
              <p className="logo-subtitle">Лучшая кино-библиотека</p>
            </div>
          </div>

          <div className="header-right">
            {isLoggedIn ? (
              <div className="user-profile">
                <div 
                  className="user-avatar" 
                  onClick={() => navigate('/profile')}
                  title={userName}
                >
                  <User className="icon" size={20} />
                </div>
              </div>
            ) : (
              <button className="login-button" onClick={handleAuthClick}>
                <User className="icon" />
                <span>Войти</span>
              </button>
            )}
            
            <button
              className="menu-button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="icon" /> : <Menu className="icon" />}
            </button>
          </div>
        </div>

        <nav className="desktop-nav">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className="nav-link">
              {link.name}
            </a>
          ))}
        </nav>
      </div>

      {isMenuOpen && (
        <div className="mobile-menu">
          <nav className="mobile-nav">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="mobile-nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            
            {isLoggedIn ? (
              <div className="mobile-user-info">
                <div 
                  className="mobile-user-avatar" 
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate('/profile');
                  }}
                >
                  <User className="icon" size={18} />
                </div>
              </div>
            ) : (
              <button 
                className="mobile-login-button"
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate('/login');
                }}
              >
                <User className="icon" />
                <span>Войти в аккаунт</span>
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;