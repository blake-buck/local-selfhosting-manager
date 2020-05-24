import * as path from 'path';
import * as filesystem from 'fs'
const fs = filesystem.promises;

import { OPERATING_SYSTEM, WINDOWS, APPLICATIONS_TABLE } from "../../environment";
import { getWindowsUser } from "../utils/getWindowsUser";
import { updateItemById, queryItemById } from "../database";
import { rootDirectory } from '../utils/paths';


export async function createShortcutScript(shortcutName, applicationId, port){
    if(OPERATING_SYSTEM === WINDOWS){

        // Create a shortcut file on user desktop
        try{
            const username = await getWindowsUser();
            
    
            await updateItemById(APPLICATIONS_TABLE, applicationId, {shortcutPort:port})
            
            const shortcutPath = `C:\\Users\\${username}\\Desktop\\${shortcutName}.url`;
            
            let shortcutFileContents = `[InternetShortcut]\nURL=http://localhost:${port}`;
    
            // if the application has a favicon, add it to the shortcut
            const favicon = (await queryItemById(APPLICATIONS_TABLE, applicationId)).favicon;
            let iconFile = path.join(rootDirectory, favicon);
    
            if(favicon){
                shortcutFileContents += `\nIconIndex=0\nIconFile=${iconFile}`
            }
    
            await fs.writeFile(
                shortcutPath,
    
                shortcutFileContents,
    
                {encoding:'utf-8'}
            );
    
            return {status:200, message:'Shortcut added to user desktop.'};
        }
        catch(e){
            return {status:500, message:e};
        }
        
    }
    else{
        return {status:500, message:'Unrecognized operating system!'};
    }
}
