import * as express from 'express';
import * as path from 'path';
import { distJavascript, distHtml, applicationsPath } from './paths';

export function serveClient(app){

    app.get(
        '/index.js',
        (req, res) => {
            res.sendFile(path.join(distJavascript, 'index.js'));
        }
    );

    app.get(
        '*', 
        express.static(distHtml),
        (req, res) => {
            console.log(req.url);

            if(req.url.includes('.ico')){
                res.sendFile(path.join(applicationsPath, req.url.replace('applications/', '')));
            }
            else{
                res.sendFile(path.join(distHtml, req.url));
            }
        }
    );
}