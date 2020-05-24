import * as filesystem from 'fs'
const fs = filesystem.promises;

import { OPERATING_SYSTEM, WINDOWS, INDEPENDENT } from "../../environment";
import { getWindowsUser } from "../utils/getWindowsUser";


// first two process.argv variables are file paths, the rest are arguments passed to the script
// if the script is being run independently, it will have a 3rd argument equal to 'INDEPENDENT'
if(process.argv[2] === INDEPENDENT){
    removeFromStartupScript()
        .then(res => {
            console.log(res);
            process.exit();
        });
}

export async function removeFromStartupScript(){
    if(OPERATING_SYSTEM === WINDOWS){
        // remove pm2 resurrect batch file from windows startup
        try{
            const username = await getWindowsUser();
            const startupFilePath = `C:\\Users\\${username}\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Startup\\local-selfhosting-manager-reboot.bat`;
    
            try{
                await fs.unlink(startupFilePath);
            }
            catch(e){
                return {status:500, message:e};
            }
            
            return {status:200, message:'Applications will not restart whenever computer is rebooted.'};

        }
        catch(e){
            return {status:500, message:e};
        }
    }
    else{
        return {status:500, message:'Unrecognized operating system!'};
    }
}