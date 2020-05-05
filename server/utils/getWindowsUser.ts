import { exec } from 'child_process';
import { rootDirectory } from './paths';

export async function getWindowsUser(){
    return new Promise(
        (resolve, reject) => {
            exec(
                'get_windows_user.bat',
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

