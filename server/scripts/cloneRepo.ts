import { exec } from 'child_process';
import { applicationsPath } from '../utils/paths';

export async function cloneRepoScript(repoUrl){
    try{

        return new Promise((resolve, reject) => exec(
            `git clone ${repoUrl}`, 
            {
                cwd:applicationsPath
            }, 
            async (err, stdout, stderr) => {
                if(err){
                    console.log("ERR", err);
                    resolve({status:400, message:err});
                }
                // Don't like how this feels, should get to the bottom of why Cloning into... is output through stderr
                else if(stderr.includes('Cloning into')){
                   return resolve({status:200});
                }
                else if(!stderr.includes('Cloning into')){
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