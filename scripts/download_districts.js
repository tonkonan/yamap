const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function downloadAltaiDistricts() {
    try {
        console.log('Скачиваем данные районов с GitHub...');
        const response = await axios.get('https://raw.githubusercontent.com/tsamsonov/r-geo-course/master/data/altai.geojson');
        
        // Сохраняем в файл
        const outputPath = path.join(__dirname, '..', 'public', 'data', 'altai_districts.geojson');
        fs.writeFileSync(outputPath, JSON.stringify(response.data, null, 2));
        
        console.log(`Данные сохранены в ${outputPath}`);
    } catch (error) {
        console.error('Ошибка при скачивании данных:', error);
    }
}

downloadAltaiDistricts(); 