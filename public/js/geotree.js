// Константы для работы с GeoTree API
const GEO_KEY = '8emEnXN8laSk'; // Твой API-ключ для GeoTree
const GEOTREE_BASE_URL = 'https://api.geotree.ru/v1';

// Функция для загрузки списка регионов
async function fetchRegions() {
  try {
    const response = await fetch(`${GEOTREE_BASE_URL}/regions`, {
      headers: { 'X-Api-Key': GEO_KEY }
    });
    
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка при загрузке регионов:', error);
    return [];
  }
}

// Функция для загрузки геометрии конкретного региона
async function fetchRegionGeometry(regionId) {
  try {
    const response = await fetch(`${GEOTREE_BASE_URL}/regions/${regionId}/geometry`, {
      headers: { 'X-Api-Key': GEO_KEY }
    });
    
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    return data.geometry;
  } catch (error) {
    console.error(`Ошибка при загрузке геометрии региона ${regionId}:`, error);
    return null;
  }
}

// Функция для загрузки списка районов конкретного региона
async function fetchDistricts(regionId) {
  try {
    const response = await fetch(`${GEOTREE_BASE_URL}/regions/${regionId}/districts`, {
      headers: { 'X-Api-Key': GEO_KEY }
    });
    
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Ошибка при загрузке районов региона ${regionId}:`, error);
    return [];
  }
}

// Функция для загрузки геометрии конкретного района
async function fetchDistrictGeometry(districtId) {
  try {
    const response = await fetch(`${GEOTREE_BASE_URL}/districts/${districtId}/geometry`, {
      headers: { 'X-Api-Key': GEO_KEY }
    });
    
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    return data.geometry;
  } catch (error) {
    console.error(`Ошибка при загрузке геометрии района ${districtId}:`, error);
    return null;
  }
}

// Функция для генерации случайного цвета
function getRandomColor() {
  return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
}

// Функция для добавления полигона на карту
function addPolygonToMap(map, geometry, properties, options = {}) {
  if (!geometry || !geometry.coordinates) return null;
  
  // Обрабатываем разные типы геометрий
  if (geometry.type === 'Polygon') {
    return addSinglePolygon(map, geometry.coordinates, properties, options);
  } else if (geometry.type === 'MultiPolygon') {
    // Для MultiPolygon добавляем каждый полигон отдельно
    const polygons = [];
    for (const coords of geometry.coordinates) {
      const polygon = addSinglePolygon(map, coords, properties, options);
      if (polygon) polygons.push(polygon);
    }
    return polygons;
  }
  return null;
}

// Вспомогательная функция для добавления одного полигона
function addSinglePolygon(map, coordinates, properties, options = {}) {
  const polygon = new ymaps.Polygon(coordinates, properties, {
    fillColor: options.fillColor || getRandomColor(),
    fillOpacity: options.fillOpacity || 0.5,
    strokeColor: options.strokeColor || '#333',
    strokeWidth: options.strokeWidth || 2,
    strokeStyle: options.strokeStyle || 'solid',
    ...options
  });
  
  map.geoObjects.add(polygon);
  return polygon;
}

// Экспортируем функции для использования в основном файле
window.geoTreeApi = {
  fetchRegions,
  fetchRegionGeometry,
  fetchDistricts,
  fetchDistrictGeometry,
  addPolygonToMap,
  getRandomColor
}; 