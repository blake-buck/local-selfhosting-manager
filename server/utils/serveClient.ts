import * as express from 'express';
import * as path from 'path';

export function serveClient(app){
    app.get(
        '*', 
        express.static(path.join(__dirname, '../../client/')),
        (req, res) => {
            res.sendFile(path.join(__dirname, '../../client/index.html'))
        }
    );
}