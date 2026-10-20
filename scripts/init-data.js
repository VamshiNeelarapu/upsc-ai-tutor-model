const fs = require('fs');
const path = require('path');
const { buildData } = require('../lib/seed');

const dataPath = process.env.DATA_PATH || path.join(__dirname, '..', 'data', 'progress.json');
const dataDir = path.dirname(dataPath);

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(dataPath, JSON.stringify(buildData(), null, 2));
console.log(`Created ${dataPath}`);
