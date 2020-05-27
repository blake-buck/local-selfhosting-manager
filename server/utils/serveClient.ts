import * as express from 'express';
import * as path from 'path';
import { distJavascript, distHtml, applicationsPath } from './paths';

export function serveClient(app){

    app.get(
        '*', 
        express.static(distJavascript),
        (req, res) => {
            if(req.url.includes('.ico')){
                res.sendFile(path.join(applicationsPath, req.url.replace('applications/', '')));
            }
            else{
                res.sendFile(path.join(distJavascript, req.url));
            }
        }
    );
}