import * as crypto from 'crypto';
import * as path from 'path';

import * as filesystem from 'fs'
const fs = filesystem.promises;


async function addToDatabase(tableToUpdate, value){
    const dbPath = path.join(__dirname, '../../db/db.json');

    const db = JSON.parse(
        await fs.readFile(dbPath, {encoding:'utf8'})
    );

    
    const table = db[tableToUpdate];

    while(true){
        let hash = crypto.createHash('sha256', {encoding:'utf8'}).update(`${Math.random()} ${Math.random()}`).digest('base64');
        
        console.log(hash);

        if(table[hash] === undefined){
            table[hash] = {id:hash, ...value};
            break;
        }
    }

    await fs.writeFile(dbPath, JSON.stringify(db));

    return true;
}

export function useApplicationRoutes(app){
    app.post('/api/application', (req, res) => {
        addToDatabase('applications', req.body);
        res.status(200).send({status:200, message:'ALL GOOD'});
    })
}