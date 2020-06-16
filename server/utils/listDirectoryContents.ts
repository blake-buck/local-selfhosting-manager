import * as filesystem from 'fs'
import { applicationsPath } from './paths';
import * as path from 'path';
const fs = filesystem.promises;

export async function listApplicationContents(path:string){
    let contents = {};

    let directoryContents = await fs.readdir(
        path, 
        {withFileTypes:true}
    );
    

    for(let i=0; i < directoryContents.length; i++){
        const dirent = directoryContents[i];

        if(dirent.isFile()){
            contents[dirent.name] = true;
        }

        if(dirent.isDirectory() && dirent.name !== '.git'){
            contents[dirent.name] = await listApplicationContents(`${path}/${dirent.name}`);
        }

    }

    return contents;
}