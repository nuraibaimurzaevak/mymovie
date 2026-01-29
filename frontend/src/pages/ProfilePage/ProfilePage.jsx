// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../../components/Header';
import './ProfilePage.css';
import { 
  LogOut
} from 'lucide-react';

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserData = () => {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) {
          navigate('/login');
          return;
        }

        const parsedUser = JSON.parse(userData);
        
        const userWithStats = {
          ...parsedUser,
          username: parsedUser.username || 'Пользователь',
          email: parsedUser.email || 'user@example.com',
          avatar: parsedUser.avatar || null
        };

        setUser(userWithStats);
      } catch (error) {
        console.error('Ошибка загрузки пользователя:', error);
        setUser({
          username: 'Пользователь',
          email: 'user@example.com'
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userCollections');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="profile-page">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <Header />
        <div className="error-container">
          <h2>Ошибка загрузки профиля</h2>
          <button onClick={() => window.location.reload()}>Попробовать снова</button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Header />
      
      <main className="profile-container">
        {/* Шапка профиля */}
        <div className="profile-header">
          <div className="header-content">
            <div className="profile-avatar-section">
              <div className="profile-avatar">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} />
                ) : (
                  <span>{user.username?.charAt(0).toUpperCase() || 'П'}</span>
                )}
              </div>
            </div>
            
            <div className="profile-info">
              <div className="profile-main">
                <h1 className="profile-username">{user.username}</h1>
                <p className="profile-email">{user.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Выход */}
        <div className="logout-section">
          <button 
            onClick={handleLogout} 
            className="logout-button"
          >
            <LogOut size={18} />
            <span>Выйти</span>
          </button>
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;