// src/context/CollectionsContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { collectionsAPI } from '../api/collections';

const CollectionsContext = createContext();

export const useCollections = () => {
  const context = useContext(CollectionsContext);
  if (!context) {
    throw new Error('useCollections must be used within CollectionsProvider');
  }
  return context;
};

export const CollectionsProvider = ({ children }) => {
  // СОСТОЯНИЯ
  const [userCollections, setUserCollections] = useState([]);
  const [collectionMovies, setCollectionMovies] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  
  const [loading, setLoading] = useState({
    collections: false,
    movies: false,
    action: false
  });
  
  const [error, setError] = useState(null);

  // МЕТОДЫ
  
  // 1. Загрузка коллекций пользователя
  const loadUserCollections = useCallback(async () => {
    setLoading(prev => ({ ...prev, collections: true }));
    setError(null);
    
    try {
      // Пробуем загрузить из API
      const data = await collectionsAPI.getMyCollections();
      console.log('📡 Данные с сервера:', data);
      
      // Добавляем системные коллекции
      const systemCollections = [
        { 
          _id: 'favorites', 
          name: 'Избранное', 
          icon: '❤️', 
          color: '#EC4899', 
          description: 'Любимые фильмы', 
          custom: false, 
          movieCount: data.favoritesCount || 0 
        },
        { 
          _id: 'watching', 
          name: 'Смотрю', 
          icon: '👁️', 
          color: '#00B4DB', 
          description: 'В процессе просмотра', 
          custom: false, 
          movieCount: data.watchingCount || 0 
        },
        { 
          _id: 'planned', 
          name: 'В планах', 
          icon: '📅', 
          color: '#8B5CF6', 
          description: 'Хочу посмотреть', 
          custom: false, 
          movieCount: data.plannedCount || 0 
        },
        { 
          _id: 'completed', 
          name: 'Просмотрено', 
          icon: '✅', 
          color: '#10B981', 
          description: 'Уже посмотрел', 
          custom: false, 
          movieCount: data.completedCount || 0 
        },
        { 
          _id: 'dropped', 
          name: 'Брошено', 
          icon: '❌', 
          color: '#EF4444', 
          description: 'Не досмотрел', 
          custom: false, 
          movieCount: data.droppedCount || 0 
        },
      ];

      // Объединяем системные и пользовательские
      const allCollections = [
        ...systemCollections,
        ...data.collections?.map(col => ({ 
          ...col, 
          custom: true,
          movieCount: col.movies?.length || 0 
        })) || []
      ];
      
      setUserCollections(allCollections);
      
      // Выбираем первую по умолчанию
      if (!selectedCollectionId && allCollections.length > 0) {
        setSelectedCollectionId(allCollections[0]._id);
      }
      
    } catch (err) {
      console.error('❌ Ошибка загрузки коллекций:', err);
      
      // Если API не отвечает, используем мок данные
      const fallbackCollections = [
        { _id: 'favorites', name: 'Избранное', icon: '❤️', color: '#EC4899', description: 'Любимые фильмы', custom: false, movieCount: 24 },
        { _id: 'watching', name: 'Смотрю', icon: '👁️', color: '#00B4DB', description: 'В процессе просмотра', custom: false, movieCount: 5 },
        { _id: 'planned', name: 'В планах', icon: '📅', color: '#8B5CF6', description: 'Хочу посмотреть', custom: false, movieCount: 42 },
        { _id: 'completed', name: 'Просмотрено', icon: '✅', color: '#10B981', description: 'Уже посмотрел', custom: false, movieCount: 156 },
        { _id: 'dropped', name: 'Брошено', icon: '❌', color: '#EF4444', description: 'Не досмотрел', custom: false, movieCount: 8 },
        { _id: 'custom1', name: 'Семейные', icon: '👨‍👩‍👧‍👦', color: '#3B82F6', description: 'Для просмотра с семьей', custom: true, movieCount: 18 },
        { _id: 'custom2', name: 'Классика', icon: '🎭', color: '#8B4513', description: 'Фильмы-классики', custom: true, movieCount: 25 },
      ];
      
      setUserCollections(fallbackCollections);
      
      if (!selectedCollectionId) {
        setSelectedCollectionId('favorites');
      }
      
      setError('API временно недоступен. Используются локальные данные.');
    } finally {
      setLoading(prev => ({ ...prev, collections: false }));
    }
  }, [selectedCollectionId]);

  // 2. Загрузка фильмов коллекции
  const loadCollectionMovies = useCallback(async (collectionId) => {
    if (!collectionId) return;
    
    setLoading(prev => ({ ...prev, movies: true }));
    
    try {
      // Для системных коллекций используем мок данные
      const systemCollectionIds = ['favorites', 'watching', 'planned', 'completed', 'dropped'];
      
      if (systemCollectionIds.includes(collectionId)) {
        // Мок фильмы для системных коллекций
        const mockMovies = [
          { _id: '1', title: 'Дюна: Часть вторая', year: 2024, rating: 8.5 },
          { _id: '2', title: 'Оппенгеймер', year: 2023, rating: 8.3 },
          { _id: '3', title: 'Начало', year: 2010, rating: 8.8 },
          { _id: '4', title: 'Темный рыцарь', year: 2008, rating: 9.0 },
        ];
        setCollectionMovies(mockMovies);
      } else {
        // Для пользовательских загружаем с API
        const data = await collectionsAPI.getCollectionById(collectionId);
        setCollectionMovies(data.movies || []);
      }
      
    } catch (err) {
      console.error('❌ Ошибка загрузки фильмов:', err);
      // Если ошибка, показываем пустой список
      setCollectionMovies([]);
    } finally {
      setLoading(prev => ({ ...prev, movies: false }));
    }
  }, []);

  // 3. Создание коллекции
  const createCollection = useCallback(async (collectionData) => {
    setLoading(prev => ({ ...prev, action: true }));
    setError(null);
    
    try {
      const data = await collectionsAPI.createCollection({
        name: collectionData.name,
        description: collectionData.description || 'Моя коллекция',
        color: collectionData.color || '#8B5CF6',
        icon: collectionData.icon || '📁',
        isPublic: false
      });
      
      const newCollection = {
        ...data,
        custom: true,
        movieCount: 0
      };
      
      setUserCollections(prev => [...prev, newCollection]);
      setSelectedCollectionId(newCollection._id);
      
      return { success: true, data: newCollection };
      
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Не удалось создать коллекцию';
      setError(errorMsg);
      
      // Создаем локально для демонстрации
      const tempCollection = {
        _id: `temp_${Date.now()}`,
        name: collectionData.name,
        description: collectionData.description || 'Моя коллекция',
        color: collectionData.color || '#8B5CF6',
        icon: collectionData.icon || '📁',
        custom: true,
        movieCount: 0
      };
      
      setUserCollections(prev => [...prev, tempCollection]);
      setSelectedCollectionId(tempCollection._id);
      
      return { 
        success: false, 
        error: 'Создано локально (API недоступен)', 
        data: tempCollection 
      };
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  }, []);

  // 4. Обновление коллекции
  const updateCollection = useCallback(async (collectionId, updateData) => {
    setLoading(prev => ({ ...prev, action: true }));
    setError(null);
    
    try {
      const data = await collectionsAPI.updateCollection(collectionId, updateData);
      
      const updatedCollection = {
        ...data,
        custom: true
      };
      
      setUserCollections(prev => 
        prev.map(col => 
          col._id === collectionId ? updatedCollection : col
        )
      );
      
      return { success: true, data: updatedCollection };
      
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Не удалось обновить коллекцию';
      setError(errorMsg);
      
      // Обновляем локально для демонстрации
      setUserCollections(prev => 
        prev.map(col => 
          col._id === collectionId 
            ? { ...col, ...updateData }
            : col
        )
      );
      
      return { success: false, error: errorMsg };
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  }, []);

  // 5. Удаление коллекции
  const deleteCollection = useCallback(async (collectionId) => {
    setLoading(prev => ({ ...prev, action: true }));
    setError(null);
    
    try {
      await collectionsAPI.deleteCollection(collectionId);
      
      setUserCollections(prev => prev.filter(col => col._id !== collectionId));
      
      // Если удалили активную, выбираем другую
      if (selectedCollectionId === collectionId) {
        const remaining = userCollections.filter(col => col._id !== collectionId);
        if (remaining.length > 0) {
          setSelectedCollectionId(remaining[0]._id);
        } else {
          setSelectedCollectionId(null);
        }
      }
      
      return { success: true };
      
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Не удалось удалить коллекцию';
      setError(errorMsg);
      
      // Удаляем локально для демонстрации
      setUserCollections(prev => prev.filter(col => col._id !== collectionId));
      
      if (selectedCollectionId === collectionId) {
        const remaining = userCollections.filter(col => col._id !== collectionId);
        setSelectedCollectionId(remaining[0]?._id || null);
      }
      
      return { success: false, error: errorMsg };
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  }, [selectedCollectionId, userCollections]);

  // 6. Очистка ошибки
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ЗАГРУЗКА ПРИ СТАРТЕ
  useEffect(() => {
    loadUserCollections();
  }, [loadUserCollections]);

  // ЗАГРУЗКА ФИЛЬМОВ ПРИ СМЕНЕ КОЛЛЕКЦИИ
  useEffect(() => {
    if (selectedCollectionId) {
      loadCollectionMovies(selectedCollectionId);
    }
  }, [selectedCollectionId, loadCollectionMovies]);

  // ВОЗВРАЩАЕМ ЗНАЧЕНИЕ КОНТЕКСТА
  const value = {
    // Данные
    userCollections,
    collectionMovies,
    selectedCollectionId,
    
    // Статусы
    loading,
    error,
    
    // Методы
    loadUserCollections,
    loadCollectionMovies,
    createCollection,
    updateCollection,
    deleteCollection,
    setSelectedCollectionId,
    clearError,
  };

  return (
    <CollectionsContext.Provider value={value}>
      {children}
    </CollectionsContext.Provider>
  );
};