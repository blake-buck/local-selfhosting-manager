import * as pm2 from 'pm2';
import { applicationsPath } from '../utils/paths';
import { autoRestartApplications } from '../utils/autoRestartApplications';
import { updateItemById, returnTable } from '../database';
import { APPLICATIONS_TABLE, INDEPENDENT, RUNNING } from '../../environment';



// first two process.argv variables are file paths, the rest are arguments passed to the script
// if the script is being run independently, it will have a 3rd argument equal to 'INDEPENDENT'
if(process.argv[2] === INDEPENDENT){
    const applicationName = process.argv[3];
    const applicationPath = process.argv[4];
    const startScript = process.argv[5];
    const scriptArgs = process.argv[6];

    startApplicationScript(applicationName, applicationPath, startScript, scriptArgs)
        .then(res => {
            console.log(res);
            process.exit();
        });
}


export async function startApplicationScript(applicationName, applicationPath, startScript, scriptArgs){
    try{
        // daemonize given application
        
        return new Promise((resolve, reject) => {
            pm2.start(
                {
                    name:   applicationName,
                    script: startScript,
                    args:   scriptArgs,
                    cwd:   `${applicationsPath}/${applicationPath}`
                },
                async (err, proc) => {
                    if(err){
                        console.log(err);
                        resolve({status:500, message:`Error starting ${applicationName}`});
                    }
                    else if(proc){

                        try{
                            await autoRestartApplications();
                            await updateItemById(APPLICATIONS_TABLE, applicationName, {status:RUNNING});
                            resolve({status:200, message:`${applicationName} is started!`, table: await returnTable(APPLICATIONS_TABLE)});
                        }
                        catch(e){
                            resolve({status:500, message:e});
                        }
                        
                    }
                }
            );
        });
    }
    catch(e){
        return {status:500, message:e};
    }
    
}