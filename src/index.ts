require('dotenv').config();
console.log(process.env?.SERVICE_PROVIDER);
console.log(process.env?.SERVICE_MONITOR);

require('./services/index.ts');
