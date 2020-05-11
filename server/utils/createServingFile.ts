import * as path from 'path';

import * as filesystem from 'fs'
const fs = filesystem.promises;

// this function adds a custom http server file to an application folder - useful for applications that dont serve themselves
export async function createServingFile(applicationPath, serveFrom, rerouteDefaultPathTo, port){
    // applicationPath - the application directory to put the http server in
    // serveFrom - the directory to serve files from
    // rerouteDefaultPathTo - redirects '/' requests to given path
    // port - the localhost port to run on
    await fs.writeFile(
        path.join(applicationPath, 'local-selfhosting-serve-file.js'),
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