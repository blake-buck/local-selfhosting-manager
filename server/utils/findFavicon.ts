import * as filesystem from 'fs';

import { applicationsPath } from './paths';
const fs = filesystem.promises;

import * as path from 'path';

export async function findFavicon(application, directoriesToExclude?){
   return searchDirectory(path.join(applicationsPath, application), directoriesToExclude)
}

async function searchDirectory(directory, directoriesToExclude?){
    // read directory contents
    const directoryContents = await fs.readdir(
        directory,
        {withFileTypes:true}
    );

    let favicon = undefined;
    for(let i = 0; i < directoryContents.length; i++){
        const dirent = directoryContents[i];

        if(dirent.name === 'favicon.ico'){
            // replace the absolute path to the favicon with a relative one
            return path.join(directory, dirent.name).replace(/.+local-selfhosting-manager/, '');
        }
        // if the dirent is a directory and isnt excluded 
        else if(dirent.isDirectory() && !directoriesToExclude?.includes(dirent.name)){

            // call searchDirectory for dirent
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


