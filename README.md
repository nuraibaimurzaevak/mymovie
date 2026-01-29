# 🎬 Flicklib - Библиотека фильмов

🚀 Мгновенный запуск за 3 минуты

📦 Быстрая установка (автоматический скрипт)

bash
# 1. Клонируйте проект
git clone https://github.com/nuraibaimurzaevak/mymovie.git
cd movie-library

# 2. Запустите установочный скрипт (автоматически настраивает всё)
./setup.sh
ИЛИ вручную выполните команды ниже

📋 Ручная установка (шаг за шагом)

Шаг 1: Установите зависимости

bash
# Для Ubuntu/Debian:
sudo apt update
sudo apt install -y nodejs npm mongodb git curl

# Для macOS:
brew install node mongodb-community

# Для Windows:
Скачайте Node.js с nodejs.org и MongoDB с mongodb.com

Шаг 2: Настройте проект

bash
# 1. Скачайте проект
git clone https://github.com/nuraibaimurzaevak/mymovie.git

cd my-movie
# 2. Запустите скрипт настройки

chmod +x install.sh && ./install.sh

Шаг 3: Настройте API ключ TMDB

bash
# Получите БЕСПЛАТНЫЙ ключ TMDB:
1. Откройте: https://www.themoviedb.org/signup
   
3. Зарегистрируйтесь (30 секунд)
   
5. Перейдите: https://www.themoviedb.org/settings/api
   
7. Нажмите "Create" → "Developer"
   
9. Скопируйте ключ (пример: 1a2b3c4d5e6f7g8h9i0j)

# Автоматически создаст .env файл с вашим ключом
./configure.sh YOUR_TMDB_API_KEY

ИЛИ создайте вручную:

echo "TMDB_API_KEY=ваш_ключ_тут" > .env

echo "MONGODB_URI=mongodb://localhost:27017/movielib" >> .env

echo "PORT=5000" >> .env

Шаг 4: Запустите всё одной командой

bash
# Запускает MongoDB, бэкенд и фронтенд
npm run start:all
ИЛИ
./start.sh

🎯 Готово! Откройте в браузере:

🔗 Фронтенд: http://localhost:3000

🔗 API Сервер: http://localhost:5000

🔗 Документация API: http://localhost:5000/api-docs

🛠 Скрипты для быстрого управления

bash
Только бэкенд
npm run dev

Только фронтенд
npm start

Перезапуск MongoDB
npm run mongo:restart

Сброс базы данных
npm run db:reset

# Загрузка тестовых данных
npm run seed

Автоматическая структура проекта

Проект создаст все нужные папки и файлы автоматически:

text
movie-library/

├──backend/ # Бэкенд на Node.js

├──frontend/ # Фронтенд на React

├─ .env/ # Конфигурация (создается автоматически)

├─ package.json # Скрипты управления

├─ setup.sh # Автоматическая установка

├── start.sh # Автоматический запуск

└── README.md # Эта инструкция


🔧 Файлы для автоматической настройки

setup.sh (автоматическая установка)

bash

#!/bin/bash

echo "🎬 Установка Movie Library..."

# Установка Node.js
if ! command -v node &> /dev/null; then

echo "📦 Устанавливаем Node.js..."

curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

sudo apt install -y nodejs
fi

# Установка MongoDB
if ! command -v mongod &> /dev/null; then

echo "🗄️ Устанавливаем MongoDB..."

wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

sudo apt update

sudo apt install -y mongodb-org

sudo systemctl start mongod

sudo systemctl enable mongod

# Установка зависимостей
echo "📥 Устанавливаем зависимости..."

npm install

cd client && npm install

cd ..

# Создание .env файла
if [ ! -f .env ]; then

echo "⚙️ Создаем конфигурационный файл..."

cat > .env << EOL

TMDB_API_KEY=ваш_ключ_сюда

MONGODB_URI=mongodb://localhost:27017/movielib

PORT=5000

JWT_SECRET=$(openssl rand -hex 32)

FRONTEND_URL=http://localhost:3000

echo "✅ .env файл создан. Не забудьте добавить TMDB API ключ!"

echo "✅ Установка завершена!"

echo "👉 Запустите: npm start"

start.sh (автоматический запуск)

bash

#!/bin/bash

echo "🚀 Запуск Movie Library..."

# Проверка MongoDB

if ! pgrep -x "mongod" > /dev/null; then

echo "🗄️ Запускаем MongoDB..."

sudo systemctl start mongod



# Проверка .env файла

if [ ! -f .env ]; then

echo "❌ Файл .env не найден!"

echo "Создайте его: cp .env.example .env"

echo "И добавьте TMDB API ключ"

exit 


# Запуск сервера
echo "🔧 Запускаем бэкенд..."
cd server
npm run dev &

# Запуск клиента
echo "🎨 Запускаем фронтенд..."

cd ../client

npm start &


echo "✅ Всё запущено!"

echo "🌐 Фронтенд: http://localhost:3000"

echo "⚙️ API: http://localhost:5000"

echo "📊 MongoDB: mongodb://localhost:27017"

package.json (скрипты управления)

json
{
"name": "movie-library",

"version": "1.0.0",

"scripts": {
"start": "concurrently \"npm run server\" \"npm run client\"",

"server": "cd server && npm run dev",

"client": "cd client && npm start",

"install:all": "npm install && cd client && npm install",

"mongo:start": "sudo systemctl start mongod",

"mongo:stop": "sudo systemctl stop mongod",

"mongo:status": "sudo systemctl status mongod",

"db:reset": "cd server && npm run db:reset",

"seed": "cd server && npm run seed",

"test": "cd server && npm test && cd ../client && npm test",

"build": "cd client && npm run build"

},
"devDependencies": {

"concurrently": "^8.0.0"

}

}

🔍 Проверка работоспособности

После запуска откройте терминал и проверьте:

bash
# Проверка API
curl http://localhost:5000/health

Ответ: {"status":"ok","tmdb":"connected"}

Проверка MongoDB

mongosh --eval "db.stats()"

Проверка фронтенда
curl -I http://localhost:3000

# ❓ Частые проблемы и решения

Порт уже занят

bash
# Освободите порт
sudo lsof -ti:3000,5000,27017 | xargs kill -9

MongoDB не запускается

bash
# Создайте директорию для данных
sudo mkdir -p /data/db

sudo chown -R $USER /data/db

mongod --dbpath /data/db

Нет прав на выполнение скриптов

bash
chmod +x *.sh

API ключ не работает

bash
# Проверьте ключ
curl "https://api.themoviedb.org/3/authentication?api_key=ВАШ_КЛЮЧ"
# Должен вернуть {"success":true}

🎉 Всё готово!

Теперь у вас есть:

✅ Работающий бэкенд сервер

✅ Современный фронтенд

✅ База данных

✅ Интеграция с TMDB

✅ Готовое приложение!

Откройте http://localhost:3000 и начинайте смотреть фильмы! 🍿
