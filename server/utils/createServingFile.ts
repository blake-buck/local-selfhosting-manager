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
        const express = require('express');
        const path = require('path');
        const app = express();

        const serveFrom = '${serveFrom}';
            const rerouteDefaultPathTo = '${rerouteDefaultPathTo}';

            app.get('*', express.static(path.join(__dirname, '..',  serveFrom)), (req, res) => {
                if(rerouteDefaultPathTo && req.url === '/'){
                    res.sendFile(path.join(__dirname, '..', rerouteDefaultPathTo));
                }
                else{
                    res.sendFile(path.join(__dirname, '..', serveFrom));
                }
                
            })
    

        app.listen(${port});


        
        `
    );

    return true;
}