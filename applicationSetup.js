const fs = require('fs').promises;
const path = require('path');

async function applicationSetup(){
    await fs.mkdir(path.join(__dirname, 'applications'));

    await fs.mkdir(path.join(__dirname, 'db'));
    await fs.writeFile(
        path.join(__dirname, 'db', 'db.json'),
        `{"applications":{}, "autostart":false}`
    );

    await fs.writeFile(
        path.join(__dirname, '.env'),
        `PORT=12500
        OPERATING_SYSTEM=${process.argv[2]}`
    );
}

applicationSetup().then(res => console.log('Application setup successfully and ready to start. "npm run start" or "npm run start-permanent" to get started hosting applications locally!'))