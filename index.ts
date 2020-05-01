import {SERVER_PORT} from './environment';
import * as path from 'path';
import * as bodyparser from 'body-parser';


import * as express from 'express';
import {useApplicationRoutes} from './routes/application';
const app = express();

app.use(bodyparser.json());

useApplicationRoutes(app);

app.get(
    '*', 
    express.static(path.join(__dirname, '../client/')),
    (req, res) => {
        res.sendFile(path.join(__dirname, '../client/index.html'))
    }
);

app.listen(SERVER_PORT, () => console.log(`LISTENING ON PORT ${SERVER_PORT}`));