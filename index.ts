import * as express from 'express';
import {SERVER_PORT} from './environment';
const path = require('path');

const app = express();

app.get(
    '*', 
    express.static(path.join(__dirname, '../client/')),
    (req, res) => {
        res.sendFile(path.join(__dirname, '../client/index.html'))
    }
);

app.listen(SERVER_PORT, () => console.log(`LISTENING ON PORT ${SERVER_PORT}`));