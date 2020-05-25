import * as express from 'express';
import * as bodyparser from 'body-parser';

import {useApplicationRoutes} from './routes';

import { serveClient } from './utils/serveClient';

import {SERVER_PORT} from '../environment';


const app = express();

// these functions need to be called in this order - bodyparser needs to be first so request bodies can be parsed
// serveClient needs to be last because otherwise its wildcard GET would prevent application GET requests from being read
app.use(bodyparser.json());

useApplicationRoutes(app);

serveClient(app);

const server = app.listen(SERVER_PORT, () => console.log(`LISTENING ON PORT ${SERVER_PORT}`));

// increase server timeout to 5 minutes; some requests like applicationSetup can take a long time to complete
server.timeout = 300000;