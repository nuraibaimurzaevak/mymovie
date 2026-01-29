// 📁 frontend/src/components/ApiTest.js
import React, { useEffect, useState } from 'react';
import { collectionsAPI } from '../api/collections';

const ApiTest = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const testApi = async () => {
      try {
        setLoading(true);
        const data = await collectionsAPI.getPopularCollections();
        setCollections(data);
        setError('');
      } catch (err) {
        setError('Ошибка подключения к API: ' + err.message);
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    testApi();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Тест подключения к API</h2>
      
      {loading && <p>Загрузка данных...</p>}
      
      {error && (
        <div style={{ color: 'red', margin: '10px 0' }}>
          <p><strong>Ошибка:</strong> {error}</p>
          <p>Проверьте:</p>
          <ul>
            <li>Запущен ли бэкенд? (localhost:5000)</li>
            <li>Настройки CORS в server.js</li>
            <li>Настройки proxy в package.json</li>
          </ul>
        </div>
      )}
      
      {!loading && !error && (
        <div>
          <p>✅ API подключен успешно!</p>
          <p>Найдено коллекций: {collections.length}</p>
          
          {collections.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h3>Пример коллекций:</h3>
              {collections.slice(0, 3).map((collection) => (
                <div key={collection._id} style={{ 
                  border: '1px solid #ccc', 
                  padding: '10px', 
                  margin: '10px 0' 
                }}>
                  <h4>{collection.title || 'Без названия'}</h4>
                  <p>Фильмов: {collection.stats?.movies_count || 0}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApiTest;