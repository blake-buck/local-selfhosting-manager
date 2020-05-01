import * as crypto from 'crypto';
import * as path from 'path';

import { exec } from 'child_process';


import * as filesystem from 'fs'
const fs = filesystem.promises;

interface Query{
    field:string;
    value:any;
}

const dbPath = path.join(__dirname, '../../db/db.json');
const accessDb = async () => JSON.parse(
    await fs.readFile(dbPath, {encoding:'utf8'})
);

async function addToDatabase(tableToUpdate:string, value:any){
    const db = await accessDb();

    
    const table = db[tableToUpdate];

    while(true){
        let hash = crypto.createHash('sha256', {encoding:'utf8'}).update(`${Math.random()}${Math.random()}`).digest('base64').replace(/\//g, '');

        if(table[hash] === undefined){
            table[hash] = {id:hash, ...value};
            break;
        }

    }

    await fs.writeFile(dbPath, JSON.stringify(db));

    return true;
}


async function queryItemById(tableToQuery:string, id:string){
    const db = await accessDb();
    const table = db[tableToQuery];
    return table[id];
}

async function returnTable(table:string){
    const db = await accessDb();
    return Object.values(db[table]);
}

export function useApplicationRoutes(app){
    app.get('/api/applications', async (req, res) => {
        const table = await returnTable('applications');
        if(table){
            res.status(200).send({status:200, message:'QUERY EXECUTED SUCCESSFULLY', table});
        }
        else{
            res.status(404).send({status:404, message:'APPLICATIONS TABLE NOT FOUND'})
        }
        
    });

    app.get('/api/application/:id', async (req, res) => {
        const application = await queryItemById('applications', req.params.id);

        if(application){
            res.status(200).send({status:200, message:'QUERY EXECUTED SUCCESSFULLY', application});
        }
        else{
            res.status(404).send({status:404, message:'APPLICATION NOT FOUND'});
        }
        
    });

    app.post('/api/application', async (req, res) => {
        await addToDatabase('applications', req.body);
        res.status(200).send({status:200, message:'ALL GOOD'});
    });

    app.post('/api/application/clone', async (req, res) => {
        const { repoUrl } = req.body;

        exec(
            `git clone ${repoUrl}`, 
            {
                cwd:path.join(__dirname, '../../applications')
            }, 
            (err, stdout, stderr) => {
                if(err){
                    console.log("ERR", err);
                    res.status(400).send({status:400, message:err});
                }
                // Don't like how this feels, should get to the bottom of why Cloning into... is output through stderr
                if(stdout || stderr.includes('Cloning into')){
                    console.log("STDOUT", stdout);
                    res.status(200).send({status:200, message:stdout ? stdout : stderr});
                }
                if(!stderr.includes('Cloning into')){
                    console.log("STDERR ", stderr);
                    
                    res.status(400).send({status:400, message:stderr});
                }
            }
        );

    });
}




