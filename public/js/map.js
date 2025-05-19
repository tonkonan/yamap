// Массив с данными о регионах
const regions = [

];

// Границы регионов (в виде многоугольников)
const regionsGeometry = {
    1: [
        [53.30, 83.60], [53.40, 83.60], [53.40, 83.70], [53.38, 83.78], [53.32, 83.78], [53.30, 83.70]
    ],
    2: [
        [53.15, 83.30], [53.25, 83.35], [53.25, 83.48], [53.16, 83.45], [53.15, 83.38]
    ],
    3: [
        [53.44, 83.72], [53.56, 83.75], [53.56, 83.87], [53.50, 83.89], [53.44, 83.85]
    ],
    4: [
        [53.35, 83.78], [53.45, 83.80], [53.45, 83.92], [53.39, 83.95], [53.35, 83.86]
    ],
    5: [
        [53.65, 83.58], [53.75, 83.60], [53.76, 83.72], [53.70, 83.75], [53.64, 83.72]
    ],
    6: [
        [53.55, 83.95], [53.65, 83.95], [53.66, 84.06], [53.60, 84.08], [53.54, 84.02]
    ],
    7: [
        [53.20, 83.52], [53.30, 83.55], [53.30, 83.70], [53.22, 83.68], [53.19, 83.60]
    ],
    8: [
        [53.30, 83.92], [53.39, 83.95], [53.40, 84.05], [53.32, 84.08], [53.28, 83.98]
    ],
    9: [
        [53.40, 84.10], [53.50, 84.12], [53.50, 84.23], [53.44, 84.25], [53.40, 84.18]
    ],
    10: [
        [53.40, 83.85], [53.50, 83.85], [53.52, 83.95], [53.45, 83.98], [53.40, 83.92]
    ],
    11: [
        [53.05, 83.92], [53.15, 83.95], [53.15, 84.05], [53.08, 84.08], [53.04, 84.00]
    ],
    12: [
        [53.25, 84.12], [53.35, 84.15], [53.36, 84.25], [53.28, 84.28], [53.24, 84.20]
    ],
    13: [
        [53.35, 84.18], [53.45, 84.20], [53.46, 84.30], [53.38, 84.32], [53.34, 84.26]
    ],
    14: [
        [53.15, 84.32], [53.25, 84.35], [53.26, 84.46], [53.18, 84.48], [53.14, 84.40]
    ],
    15: [
        [53.50, 84.38], [53.60, 84.40], [53.60, 84.52], [53.52, 84.55], [53.48, 84.46]
    ],
    16: [
        [53.45, 84.18], [53.55, 84.20], [53.55, 84.30], [53.48, 84.32], [53.44, 84.25]
    ],
    17: [
        [53.60, 84.24], [53.70, 84.26], [53.70, 84.38], [53.62, 84.40], [53.58, 84.30]
    ],
    18: [
        [53.70, 84.08], [53.80, 84.10], [53.80, 84.22], [53.73, 84.24], [53.69, 84.16]
    ],
    19: [
        [53.65, 84.00], [53.75, 84.02], [53.75, 84.12], [53.68, 84.14], [53.64, 84.06]
    ],
    27: [
        [53.55, 84.08], [53.65, 84.10], [53.65, 84.22], [53.58, 84.24], [53.54, 84.18]
    ],
    31: [
        [53.50, 84.28], [53.60, 84.30], [53.60, 84.42], [53.52, 84.45], [53.48, 84.36]
    ],
    33: [
        [53.15, 83.78], [53.25, 83.80], [53.25, 83.92], [53.18, 83.94], [53.14, 83.86]
    ]
};

// Объект для хранения данных из GeoTree
let geoTreeData = {
    regions: [],
    districts: {},
    geometries: {},
    districtPolygons: {}
};

// Инициализация карты при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация карты
    ymaps.ready(initMap);
    
    // Заполняем выпадающий список регионов
    const regionSelect = document.getElementById('regionSelect');
    regions.forEach(region => {
        const option = document.createElement('option');
        option.value = region.id;
        option.textContent = region.name;
        regionSelect.appendChild(option);
    });
    
    // Обработчик выбора региона из списка
    regionSelect.addEventListener('change', function() {
        const selectedId = parseInt(this.value);
        if (selectedId) {
            const region = regions.find(r => r.id === selectedId);
            if (region) {
                // Центрируем карту на выбранном регионе
                myMap.setCenter(region.coordinates, 11);
                // Подсвечиваем выбранный регион
                highlightRegion(selectedId);
            }
        }
    });

    // Обработчик для кнопки загрузки районов Алтайского края
    document.getElementById('loadAltaiDistricts').addEventListener('click', loadAltaiDistrictsFromGeoTree);
});

let myMap;
let regionPlacemarks = [];
let regionPolygons = {};

function initMap() {
    // Создаем карту
    myMap = new ymaps.Map('map', {
        center: [53.35, 83.75], // Примерный центр Алтайского края
        zoom: 9,
        controls: ['zoomControl', 'typeSelector', 'fullscreenControl']
    });
    
    // Добавляем полигоны для всех регионов
    regions.forEach(region => {
        addRegionPolygon(region.id);
    });
    
    // Добавляем метки с названиями регионов
    regions.forEach(region => {
        addRegionToMap(region);
    });
    
    // Добавляем специальные формы для некоторых регионов
    addSpecialShapes();

    // Загружаем границу Алтайского края с API Яндекс.Карт
    ymaps.borders.load('RU', {
        lang: 'ru',
        quality: 3
    }).then(function (geojson) {
        // Отфильтровать границы Алтайского края
        const regions = ymaps.geoQuery(geojson);
        const altaiRegion = regions.search('properties.name = "Алтайский край"');
        
        // Добавляем на карту с прозрачной заливкой и толстой рамкой
        altaiRegion.addToMap(myMap);
        altaiRegion.each(function(obj) {
            obj.options.set({
                fillColor: '#91a5ff',
                fillOpacity: 0.1,
                strokeColor: '#334897',
                strokeWidth: 3,
                strokeStyle: 'longDash'
            });
        });
    }).catch(function(error) {
        console.error('Ошибка при загрузке границ:', error);
    });
}

// Функция для загрузки и отображения районов Алтайского края с Яндекс.Карт
async function loadAltaiDistrictsFromGeoTree() {
    const loader = document.getElementById('loader');
    const regionInfo = document.getElementById('regionInfo');
    
    try {
        // Показываем индикатор загрузки
        loader.style.display = 'block';
        regionInfo.innerHTML = 'Загрузка данных о районах Алтайского края...';
        regionInfo.style.display = 'block';
        
        // Названия районов Алтайского края
        const altaiDistricts = [
            'Алейский район', 'Алтайский район', 'Баевский район', 'Бийский район',
            'Благовещенский район', 'Бурлинский район', 'Быстроистокский район', 'Волчихинский район',
            'Егорьевский район', 'Ельцовский район', 'Завьяловский район', 'Залесовский район',
            'Заринский район', 'Змеиногорский район', 'Зональный район', 'Калманский район',
            'Каменский район', 'Ключевский район', 'Косихинский район', 'Красногорский район',
            'Краснощёковский район', 'Крутихинский район', 'Кулундинский район', 'Курьинский район',
            'Кытмановский район', 'Локтевский район', 'Мамонтовский район', 'Михайловский район',
            'Немецкий национальный район', 'Новичихинский район', 'Павловский район', 'Панкрушихинский район',
            'Первомайский район', 'Петропавловский район', 'Поспелихинский район', 'Ребрихинский район',
            'Родинский район', 'Романовский район', 'Рубцовский район', 'Смоленский район',
            'Советский район', 'Солонешенский район', 'Солтонский район', 'Суетский район',
            'Табунский район', 'Тальменский район', 'Тогульский район', 'Топчихинский район',
            'Третьяковский район', 'Троицкий район', 'Тюменцевский район', 'Угловский район',
            'Усть-Калманский район', 'Усть-Пристанский район', 'Хабарский район', 'Целинный район',
            'Чарышский район', 'Шелаболихинский район', 'Шипуновский район'
        ];
        
        // Карта цветов для районов
        const colors = [
            '#FF5733', '#33FF57', '#3357FF', '#F033FF', '#FF33A8',
            '#33FFF3', '#FFD133', '#33FFBD', '#BD33FF', '#FF3333',
            '#33FF33', '#3333FF', '#FFFC33', '#33FFF9', '#FF3370',
            '#33FFD4', '#D433FF', '#FF8A33', '#33A2FF', '#FFA233'
        ];
        
        // Очищаем карту от предыдущих объектов (если есть)
        if (geoTreeData.districtPolygons['01']) {
            geoTreeData.districtPolygons['01'].forEach(polygon => {
                myMap.geoObjects.remove(polygon);
            });
        }
        
        // Создаем массив для хранения полигонов районов
        geoTreeData.districtPolygons['01'] = [];
        
        // Используем поиск по региону в Яндекс.Картах
        let loadedCount = 0;
        
        for (let i = 0; i < altaiDistricts.length; i++) {
            const districtName = altaiDistricts[i];
            const colorIndex = i % colors.length;
            const color = colors[colorIndex];
            
            try {
                // Обновляем статус загрузки
                regionInfo.innerHTML = `Загружаем район: ${districtName} (${loadedCount + 1} из ${altaiDistricts.length})`;
                
                // Используем API Яндекс.Карт для геокодирования
                await new Promise((resolve, reject) => {
                    ymaps.geocode(districtName + ', Алтайский край', {
                        results: 1
                    }).then(function (res) {
                        const firstGeoObject = res.geoObjects.get(0);
                        
                        if (firstGeoObject) {
                            // Получаем границы объекта
                            const bounds = firstGeoObject.properties.get('boundedBy');
                            const center = firstGeoObject.geometry.getCoordinates();
                            
                            // Создаем полигон для района
                            // Здесь мы просто рисуем прямоугольник, так как точные границы недоступны
                            const polygon = new ymaps.Polygon([
                                [
                                    [bounds[0][0], bounds[0][1]],
                                    [bounds[0][0], bounds[1][1]],
                                    [bounds[1][0], bounds[1][1]],
                                    [bounds[1][0], bounds[0][1]],
                                    [bounds[0][0], bounds[0][1]]
                                ]
                            ], {
                                hintContent: districtName,
                                balloonContent: `<strong>${districtName}</strong>`
                            }, {
                                fillColor: color,
                                fillOpacity: 0.5,
                                strokeColor: '#333333',
                                strokeWidth: 2,
                                strokeStyle: 'solid'
                            });
                            
                            // Добавляем метку с названием района
                            const placemark = new ymaps.Placemark(center, {
                                hintContent: districtName,
                                balloonContent: `<strong>${districtName}</strong>`
                            }, {
                                preset: 'islands#redDotIcon'
                            });
                            
                            // Добавляем полигон и метку на карту
                            myMap.geoObjects.add(polygon);
                            myMap.geoObjects.add(placemark);
                            
                            // Сохраняем полигон
                            geoTreeData.districtPolygons['01'].push(polygon);
                            geoTreeData.districtPolygons['01'].push(placemark);
                            
                            loadedCount++;
                            resolve();
                        } else {
                            console.warn(`Район ${districtName} не найден`);
                            resolve();
                        }
                    }).catch(function (error) {
                        console.error(`Ошибка при геокодировании района ${districtName}:`, error);
                        resolve(); // Продолжаем даже при ошибке
                    });
                });
                
            } catch (error) {
                console.error(`Ошибка при обработке района ${districtName}:`, error);
            }
        }
        
        // Обновляем информацию о загруженных данных
        regionInfo.innerHTML = `
            <div>
                <strong>Загружено районов:</strong> ${loadedCount} из ${altaiDistricts.length}
                <p>Районы Алтайского края успешно загружены и отображены на карте.</p>
            </div>
        `;
        
        // Центрируем карту на Алтайском крае
        myMap.setCenter([53.35, 83.75], 7);
        
    } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        regionInfo.innerHTML = `
            <div style="color: red;">
                <strong>Ошибка:</strong> ${error.message}
            </div>
        `;
    } finally {
        // Скрываем индикатор загрузки
        loader.style.display = 'none';
    }
}

function addRegionToMap(region) {
    // Создаем метку для региона
    const placemark = new ymaps.Placemark(region.coordinates, {
        hintContent: region.name,
        balloonContent: `<strong>${region.name}</strong><br>${region.search}`
    }, {
        preset: 'islands#circleDotIcon',
        iconColor: '#333'
    });
    
    // Добавляем метку на карту
    myMap.geoObjects.add(placemark);
    
    // Сохраняем метку для возможности работы с ней позже
    regionPlacemarks[region.id] = placemark;
}

function addRegionPolygon(regionId) {
    if (regionsGeometry[regionId]) {
        const region = regions.find(r => r.id === regionId);
        
        // Создаем полигон
        const polygon = new ymaps.Polygon([regionsGeometry[regionId]], {
            hintContent: region.name
        }, {
            fillColor: region.color,
            fillOpacity: 0.7,
            strokeColor: '#333333',
            strokeWidth: 3,
            strokeStyle: 'solid',
            interactivityModel: 'default#layer'
        });
        
        // Добавляем обработчик клика на полигон
        polygon.events.add('click', function() {
            // Центрируем карту на регионе
            myMap.setCenter(region.coordinates, 11);
            // Подсвечиваем выбранный регион
            highlightRegion(region.id);
            // Обновляем значение в выпадающем списке
            document.getElementById('regionSelect').value = region.id;
        });
        
        // Добавляем полигон на карту
        myMap.geoObjects.add(polygon);
        
        // Сохраняем полигон для возможности работы с ним позже
        regionPolygons[regionId] = polygon;
    }
}

function addSpecialShapes() {
    // Добавим более сложные формы для некоторых регионов
    // Например, Центральный район Барнаула (регион 1) с более реалистичными границами
    
    // Сложная форма для Центрального района (id 1)
    const complexShape1 = [
        [53.32, 83.64], [53.37, 83.66], [53.39, 83.71], 
        [53.37, 83.76], [53.34, 83.78], [53.31, 83.77], 
        [53.29, 83.75], [53.28, 83.69], [53.30, 83.65]
    ];
    
    // Создаем полигон с более сложной формой
    const polygon1 = new ymaps.Polygon([complexShape1], {
        hintContent: 'Центральный район (детализированные границы)'
    }, {
        fillColor: '#B3E5FC',
        fillOpacity: 0.7,
        strokeColor: '#333333',
        strokeWidth: 3,
        strokeStyle: 'solid',
        interactivityModel: 'default#layer'
    });
    
    // Добавляем обработчик клика
    polygon1.events.add('click', function() {
        // Центрируем карту
        myMap.setCenter([53.35, 83.70], 12);
        // Подсвечиваем выбранный регион
        highlightRegion(1);
        // Обновляем значение в выпадающем списке
        document.getElementById('regionSelect').value = 1;
    });
    
    // Добавляем полигон на карту (заменяем существующий)
    if (regionPolygons[1]) {
        myMap.geoObjects.remove(regionPolygons[1]);
    }
    myMap.geoObjects.add(polygon1);
    regionPolygons[1] = polygon1;
    
    // Второй пример - более детальный полигон для Индустриального района (id 2)
    const complexShape2 = [
        [53.14, 83.32], [53.19, 83.33], [53.23, 83.36], 
        [53.24, 83.42], [53.22, 83.47], [53.17, 83.46], 
        [53.15, 83.43], [53.13, 83.38], [53.14, 83.33]
    ];
    
    const polygon2 = new ymaps.Polygon([complexShape2], {
        hintContent: 'Индустриальный район (детализированные границы)'
    }, {
        fillColor: '#FFCCBC',
        fillOpacity: 0.7,
        strokeColor: '#333333',
        strokeWidth: 3,
        strokeStyle: 'solid',
        interactivityModel: 'default#layer'
    });
    
    polygon2.events.add('click', function() {
        myMap.setCenter([53.20, 83.40], 12);
        highlightRegion(2);
        document.getElementById('regionSelect').value = 2;
    });
    
    if (regionPolygons[2]) {
        myMap.geoObjects.remove(regionPolygons[2]);
    }
    myMap.geoObjects.add(polygon2);
    regionPolygons[2] = polygon2;
}

function highlightRegion(regionId) {
    // Сбрасываем выделение всех меток и полигонов
    Object.values(regionPlacemarks).forEach(placemark => {
        placemark.options.set('preset', 'islands#circleDotIcon');
        placemark.options.set('iconColor', '#333');
    });
    
    Object.values(regionPolygons).forEach(polygon => {
        polygon.options.set('strokeWidth', 3);
        polygon.options.set('strokeColor', '#333333');
        polygon.options.set('strokeStyle', 'solid');
    });
    
    // Выделяем выбранную метку
    if (regionPlacemarks[regionId]) {
        regionPlacemarks[regionId].options.set('preset', 'islands#redCircleDotIcon');
    }
    
    // Выделяем выбранный полигон
    if (regionPolygons[regionId]) {
        regionPolygons[regionId].options.set('strokeWidth', 5);
        regionPolygons[regionId].options.set('strokeColor', '#ff0000');
        regionPolygons[regionId].options.set('strokeStyle', 'shortdash');
    }
} 