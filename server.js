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
        console.log('Отправляем запрос к OpenStreetMap Overpass API...');
        
        // Запрос к Overpass API для получения границ районов Алтайского края
        const query = `
            [out:json][timeout:25];
            area["name:ru"="Алтайский край"]->.altai;
            (
              relation["admin_level"="6"](area.altai);
              way(r);
              node(w);
            );
            out body;
            >;
            out skel qt;
        `;
        
        const url = 'https://overpass-api.de/api/interpreter';
        console.log('URL:', url);
        console.log('Query:', query);
        
        const response = await axios.post(url, query, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        console.log('Получен ответ от Overpass API:', response.status);
        
        // Собираем данные для построения полигонов
        const elements = response.data.elements;
        const relations = elements.filter(el => el.type === 'relation');
        const ways = elements.filter(el => el.type === 'way');
        const nodes = elements.filter(el => el.type === 'node');
        
        // Создаем словарь узлов для быстрого доступа
        const nodeDict = {};
        nodes.forEach(node => {
            nodeDict[node.id] = [node.lon, node.lat];
        });
        
        // Преобразуем данные в формат GeoJSON
        const geojson = {
            type: 'FeatureCollection',
            features: relations.map(relation => {
                // Получаем все пути для этого отношения
                const relationWays = ways.filter(way => 
                    relation.members.some(member => 
                        member.type === 'way' && member.ref === way.id
                    )
                );
                
                // Собираем координаты для полигона
                const coordinates = relationWays.map(way => 
                    way.nodes.map(nodeId => nodeDict[nodeId])
                );
                
                return {
                    type: 'Feature',
                    properties: {
                        name: relation.tags.name,
                        admin_level: relation.tags['admin_level']
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: coordinates
                    }
                };
            })
        };
        
        console.log('Преобразованные данные:', JSON.stringify(geojson, null, 2));
        res.json(geojson);
        
    } catch (error) {
        console.error('Детальная ошибка при запросе к Overpass API:', {
            message: error.message,
            response: error.response ? {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers
            } : 'Нет ответа',
            config: {
                url: error.config?.url,
                method: error.config?.method,
                data: error.config?.data,
                headers: error.config?.headers
            }
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