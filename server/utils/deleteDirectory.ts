import * as filesystem from 'fs'
const fs = filesystem.promises;

export async function deleteEverythingInDirectory(path){
    let directoryContents = await fs.readdir(path, {withFileTypes:true});

    for(let i =0; i < directoryContents.length; i++){
        const dirent = directoryContents[i];
        // all files get deleted using fs.unlink
        if(dirent.isFile()){
            await fs.unlink(`${path}/${dirent.name}`)
        }

        // the function gets called for every directory in the current directory
        if(dirent.isDirectory()){
            await deleteEverythingInDirectory(`${path}/${dirent.name}`);
        }
    }

    // check to see if directory is empty after deleting everything
    directoryContents = await fs.readdir(path, {withFileTypes:true});
    if(directoryContents.length === 0){  
        await fs.rmdir(path);
    }

    return true;
}