import * as filesystem from 'fs'
const fs = filesystem.promises;

import { applicationsPath } from "../utils/paths";
import { returnTable, addToDatabase } from "../database";
import { findFavicon } from "../utils/findFavicon";
import { APPLICATIONS_TABLE, INDEPENDENT, UNCONFIGURED } from "../../environment";


// first two process.argv variables are file paths, the rest are arguments passed to the script
// if the script is being run independently, it will have a 3rd argument equal to 'INDEPENDENT'
if(process.argv[2] === INDEPENDENT){
    refreshScript().then(res => {
        console.log(res);
        process.exit();
    })
}

export async function refreshScript(){

    try{
        const applicationsFolderContents = await fs.readdir(applicationsPath);
        const applicationsInDatabase     = await returnTable(APPLICATIONS_TABLE);
    
        // if the app is in the applications folder and not in the database, add to database
        const untrackedApplicationTitles = applicationsFolderContents.filter(appTitle => !applicationsInDatabase.some((dbApp:any) => dbApp.id === appTitle));
        
        for(let i=0; i < untrackedApplicationTitles.length; i++){
            const untrackedAppTitle = untrackedApplicationTitles[i];
            await addToDatabase(APPLICATIONS_TABLE, untrackedAppTitle, {favicon: await findFavicon(untrackedAppTitle), status:UNCONFIGURED})
        }

        return {status:200, message:`Added ${untrackedApplicationTitles.length} new apps to application database.`, table: await returnTable(APPLICATIONS_TABLE)};
    }
    catch(e){
        return {status:500, message:e};
    }
    
}
