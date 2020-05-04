import * as express from 'express';
import * as bodyparser from 'body-parser';

import {useApplicationRoutes} from './server/routes';

import { serveClient } from './server/serveClient';

import {SERVER_PORT} from './environment';


const app = express();

app.use(bodyparser.json());
useApplicationRoutes(app);
serveClient(app);


const server = app.listen(SERVER_PORT, () => console.log(`LISTENING ON PORT ${SERVER_PORT}`));

server.timeout = 300000;