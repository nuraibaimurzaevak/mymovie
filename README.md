# 🎬 Flicklib - Библиотека фильмов

Тестовый проект умной библиотеки фильмов с интеграцией TMDB API.

## 🚀 Быстрый старт

### Стек технологий
- **Backend**: MongoDB
- **Frontend**: React/CSS
- **База данных**:MongoDB
- **API**: The Movie Database (TMDB) API
- **Кэширование**: bjcrypt

### 📋 Предварительные требования

1. **React**
2. **Node.js 16+** 
3. **API ключ TMDB** (бесплатный)


### ⚙️ Настройка проекта


### 🔑 Получение API ключа TMDB

1. Зарегистрируйтесь на [The Movie Database](https://www.themoviedb.org/signup)
2. Перейдите в [настройки API](https://www.themoviedb.org/settings/api)
3. Нажмите "Create" для нового API ключа
4. Выберите тип "Developer"
5. Скопируйте ключ (выглядит как `abcdef1234567890abcdef1234567890`)

### 🔑 Использование API ключа TMDB
Создайте файл .env в папке backend 
Пропишите 
a)  # ⚠️ ВАШ КЛЮЧ TMDB - получите на https://www.themoviedb.org/settings/api
TMDB_API_KEY=ваш_ключ_сюда_вставьте
 b) # ⚠️ Базовый URL API TMDB - оставьте как есть
TMDB_BASE_URL=https://api.themoviedb.org/3
⚠️ Подключение к MongoDB
c)  # Вариант 1: Локальная MongoDB
MONGODB_URI=mongodb://localhost:27017/movielib
d) # Вариант 2: MongoDB Atlas (облачная)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/movielib

e) # ⚠️ Секретный ключ для JWT - сгенерируйте свой или используйте этот
JWT_SECRET=ваш_секретный_ключ_минимум_32_символа
JWT_EXPIRE=30d


### ⚙️ Настройка проекта

#### 1. Клонирование репозитория
```bash
git clone https://github.com/nuraibaimurzaevak/mymovie.git
cd my-movie
cd backend > npm run dev
cd frontend > npm start


