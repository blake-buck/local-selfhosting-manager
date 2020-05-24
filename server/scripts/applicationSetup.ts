import { exec } from 'child_process';

import { applicationsPath } from "../utils/paths";

export async function applicationSetupScript(commands, application){
    try{
    
        // run the user given commands e.g. "npm install" in the selected application
        return new Promise((resolve, reject) => exec(
            commands, 
            {
                cwd:`${applicationsPath}/${application}`
            }, 
            async (err, stdout, stderr) => {
    
                if(err){
                    console.log("ERR", err);
                    resolve({status:400, message:err});
                }
    
                else if(stdout){
                    console.log("STDOUT", stdout)
                    resolve({status:200, message:stdout});
                }
    
                else if(stderr){
                    console.log("STDERR ", stderr);
                    
                    resolve({status:400, message:stderr});
                }
    
            }
        ));
    }
    catch(e){
        return {status:500, message:e};
    }
}