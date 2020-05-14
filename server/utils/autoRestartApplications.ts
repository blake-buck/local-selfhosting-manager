import * as pm2 from 'pm2';

export async function autoRestartApplications(){
    // creates a pm2 dump file containing the current running applications
    return new Promise((resolve, reject) => {
        pm2.dump(
            (err, result) => {
                if(err){
                    reject(err);
                }
                else if(result){
                    resolve(result);
                }
            }
        );
    })
    
}
