const express = require('express');
const path = require('path');
const axios = require('axios');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

// Статические файлы
app.use(express.static(path.join(__dirname, 'public')));

// Добавляем middleware для работы с JSON
app.use(express.json());

// Маршрут для главной страницы
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Маршрут для страницы OpenStreetMap
app.get('/openstreet', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'openstreet.html'));
});

// Маршрут для получения списка районов
app.get('/api/districts', async (req, res) => {
    try {
        console.log('Получен запрос на /api/districts');
        console.log('Отправляем запрос к GeoTree API...');
        
        const response = await axios.get('https://api.geotree.ru/admin.php', {
            params: {
                key: '8emEnXN8laSk',
                level: 3,
                parent: 22
            }
        });
        
        console.log('Получен ответ от GeoTree:', response.status);
        console.log('Данные:', response.data);
        
        res.json(response.data);
    } catch (error) {
        console.error('Детальная ошибка при запросе к GeoTree:', {
            message: error.message,
            response: error.response ? {
                status: error.response.status,
                data: error.response.data
            } : 'Нет ответа',
            config: error.config
        });
        res.status(500).json({ 
            error: 'Ошибка при получении данных',
            details: error.message 
        });
    }
});

// Прокси для GeoTree API
app.get('/api/geotree/region/:id', async (req, res) => {
    try {
        const regionId = req.params.id;
        const response = await fetch(`https://api.geotree.ru/region/${regionId}?key=8emEnXN8laSk&format=geojson&quality=2&lang=ru_RU`);
        
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Ошибка при запросе к GeoTree:', error);
        res.status(500).json({ error: error.message });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});