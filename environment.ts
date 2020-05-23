import * as dotenv from 'dotenv';
dotenv.config();

export const SERVER_PORT:string = process.env.PORT;
export const OPERATING_SYSTEM:string =  process.env.OPERATING_SYSTEM;

export const WINDOWS = 'WINDOWS';
export const FAVICON = 'favicon.ico';

export const INDEPENDENT = 'INDEPENDENT';

export const RUNNING = 'RUNNING';
export const STOPPED = 'STOPPED';
export const UNCONFIGURED = 'UNCONFIGURED';

export const APPLICATIONS_TABLE = 'applications';