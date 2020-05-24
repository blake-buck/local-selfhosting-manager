import * as filesystem from 'fs'
const fs = filesystem.promises;

import { OPERATING_SYSTEM, WINDOWS, INDEPENDENT } from "../../environment";
import { getWindowsUser } from "../utils/getWindowsUser";


// first two process.argv variables are file paths, the rest are arguments passed to the script
// if the script is being run independently, it will have a 3rd argument equal to 'INDEPENDENT'
if(process.argv[2] === INDEPENDENT){
    addToStartupScript()
        .then(res => {
            console.log(res);
            process.exit();
        });
}


export async function addToStartupScript(){
    if(OPERATING_SYSTEM === WINDOWS){
        // add a batch file to windows startup that runs pm2 resurrect 
        try{
            const username = await getWindowsUser();

            await fs.writeFile(
                `C:\\Users\\${username}\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Startup\\local-selfhosting-manager-reboot.bat`,
                
                'pm2 resurrect',
                
                {encoding:'utf8'}
            );

            return {status:200, message:'Applications will restart whenever computer is rebooted.'};
        }
        catch(e){
            return {status:500, message:e};
        }

    }
    else{
        return {status:500, message:'Unrecognized operating system!'};
    }
}