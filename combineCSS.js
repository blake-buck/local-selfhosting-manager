const fs = require('fs').promises;
const path = require('path');

async function combineCSS(){
    let combinedCSS = '';
    const styleDirectoryPath = path.join(__dirname, './client/styles');
    const distPath = path.join(__dirname, './dist/client/index.css');

    const styleDirectoryContents = await fs.readdir(styleDirectoryPath);

    for(let i=0; i < styleDirectoryContents.length; i++){
        const dirName = styleDirectoryContents[i];
        const fileContents = await fs.readFile(path.join(styleDirectoryPath, dirName), 'utf8');
        combinedCSS += fileContents;
    }

    await fs.writeFile(distPath, combinedCSS);
}

combineCSS();