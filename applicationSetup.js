const fs = require('fs').promises;
const path = require('path');

(async () => {
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
})();
