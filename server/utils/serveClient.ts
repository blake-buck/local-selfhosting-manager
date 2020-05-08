import * as express from 'express';
import * as path from 'path';
import { distJavascript, distHtml, applicationsPath } from './paths';

export function serveClient(app){

    app.get(
        '*', 
        express.static(distHtml),
        express.static(distJavascript),
        (req, res) => {
            if(req.url.includes('.ico')){
                res.sendFile(path.join(applicationsPath, req.url.replace('applications/', '')));
            }
            else if(req.url.includes('.js')){
                res.sendFile(path.join(distJavascript, 'scripting', req.url));
            }
            else{
                res.sendFile(path.join(distHtml, req.url));
            }
        }
    );
}