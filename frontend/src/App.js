// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage';
import MoviePage from './components/MoviePage';
import CatalogPage from './pages/CatalogPage/CatalogPage';
import CollectionsPage from './pages/CollectionPage/CollectionsPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import LoginPage from './pages/AuthPages/LoginPage';
import RegisterPage from './pages/AuthPages/RegisterPage';
import SearchPage from './pages/SearchPage/SearchPage';
import { CollectionsProvider } from './context/CollectionsContext';

function App() {
  return (
    <CollectionsProvider>
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/movie/:id" element={<MoviePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/search" element={<SearchPage />} />
        
      </Routes>
    </Router>

    </CollectionsProvider>
  );
}

export default App;