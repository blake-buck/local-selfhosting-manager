import * as path from 'path';

import * as filesystem from 'fs'
const fs = filesystem.promises;

export async function createServingFile(applicationPath, serveFrom, rerouteDefaultPathTo, port){
    await fs.writeFile(
        path.join(__dirname, '../../applications', applicationPath, 'local-selfhosting-serve-file.js'),
        `
        const http = require('http');
        const fs   = require('fs').promises;
        const path = require('path');
        const server = http.createServer(async (req, res) => {
            const serveFrom = '${serveFrom}';
            const rerouteDefaultPathTo = '${rerouteDefaultPathTo}';
            try{
                if(rerouteDefaultPathTo && req.url === '/'){
                    res.end(await fs.readFile(path.join(__dirname, serveFrom, rerouteDefaultPathTo), 'utf-8'));
                }
                else if(!req.url.includes('local-selfhosting-serve-file.js')){
                    res.end(
                        await fs.readFile(path.join(__dirname, serveFrom, req.url), 'utf-8')
                    );
                }
                
            }
            catch(e){
                console.log(e);
            }
            
        });
    
        server.listen(${port});
        `
    );

    return true;
}