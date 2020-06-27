import { exec } from 'child_process';
import { rootDirectory } from './paths';

// executes a batch file to get the windows username
export async function getLinuxUser(){
    return new Promise(
        (resolve, reject) => {
            exec(
                'get_linux_user.sh',
                {
                    cwd:rootDirectory
                },
                async (err, stdout, stderr) => {
                    if(err){
                        console.log(err);
                        reject(err);
                    }
                    else if(stdout){
                        const username = stdout.split('\n')[2].trim();
                        resolve(username);
                    }
                    else if(stderr){
                        reject(stderr);
                    }
                   
                }
            );
        }
    );
}