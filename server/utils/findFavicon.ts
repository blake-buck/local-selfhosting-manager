import * as filesystem from 'fs';

import { applicationsPath } from './paths';
const fs = filesystem.promises;

import * as path from 'path';

export async function findFavicon(application, directoriesToExclude?){
   return searchDirectory(path.join(applicationsPath, application), directoriesToExclude)
}

async function searchDirectory(directory, directoriesToExclude?){
    const directoryContents = await fs.readdir(
        directory,
        {withFileTypes:true}
    );

    let favicon = undefined;
    for(let i = 0; i < directoryContents.length; i++){
        const dirent = directoryContents[i];
        if(dirent.name === 'favicon.ico'){
            console.log('FOUND IT')
            
            return path.join(directory, dirent.name);
        }
        else if(dirent.isDirectory() && !directoriesToExclude?.includes(dirent.name)){
            let potentialFavicon = await searchDirectory(
                path.join(directory, dirent.name), 
                directoriesToExclude
            );
            if(potentialFavicon){
                return potentialFavicon;
            }
        }
    }

    if(favicon){
        return favicon;
    }

}


