import * as path from 'path';

import * as filesystem from 'fs'
const fs = filesystem.promises;

const dbPath = path.join(__dirname, '../../db/db.json');
const accessDb = async () => JSON.parse(
    await fs.readFile(dbPath, {encoding:'utf8'})
);

export async function addToDatabase(tableToUpdate:string, key:any, value:any){
    const db = await accessDb();
    
    const table = db[tableToUpdate];

    let hash = key;
    while(true){
        
        if(table[hash] === undefined){
            table[hash] = {id:hash, ...value};
            break;
        }
        
        hash += 'I'

    }

    await fs.writeFile(dbPath, JSON.stringify(db));

    return true;
}


export async function queryItemById(tableToQuery:string, id:string){
    const db = await accessDb();
    const table = db[tableToQuery];
    return table[id];
}

export async function deleteItemById(tableToQuery:string, id:string){
    const db = await accessDb();
    const table = db[tableToQuery];
    delete table[id];
    
    await fs.writeFile(dbPath, JSON.stringify(db))

    return true
}

export async function returnTable(table:string){
    const db = await accessDb();
    return Object.values(db[table]);
}