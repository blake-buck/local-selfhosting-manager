import * as pm2 from 'pm2';
import { applicationsPath } from '../utils/paths';
import { autoRestartApplications } from '../utils/autoRestartApplications';
import { updateItemById, returnTable } from '../database';
import { APPLICATIONS_TABLE, INDEPENDENT, STOPPED } from '../../environment';


// first two process.argv variables are file paths, the rest are arguments passed to the script
// if the script is being run independently, it will have a 3rd argument equal to 'INDEPENDENT'
if(process.argv[2] === INDEPENDENT){
    const applicationName = process.argv[3];

    stopApplicationScript(applicationName)
        .then(res => {
            console.log(res);
            process.exit();
        });
}


export async function stopApplicationScript(applicationName){
    try{
        return new Promise((resolve, reject) => {
            pm2.stop(applicationName, async (err, proc) => {
                if(err){
                    console.log(err);
                    resolve({status:500, message:`Error stopping ${applicationName}`});
                }
                else if(proc){
                    try{
                        await autoRestartApplications();
                        await updateItemById(APPLICATIONS_TABLE, applicationName, {status:STOPPED});
                        resolve({status:200, message:`${applicationName} is stopped!`, table: await returnTable(APPLICATIONS_TABLE)});
                    }
                    catch(e){
                        console.log(e)
                        resolve({status:500, message:JSON.stringify(e)});
                    }
                }
            });
        });
    }
    catch(e){
        return {status:500, message:e};
    }
    
}