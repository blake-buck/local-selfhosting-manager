import * as dotenv from 'dotenv';
dotenv.config();

export const SERVER_PORT:string = process.env.PORT;
export const OPERATING_SYSTEM:string =  process.env.OPERATING_SYSTEM;