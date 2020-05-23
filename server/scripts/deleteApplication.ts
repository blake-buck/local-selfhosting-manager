import * as filesystem from 'fs'
const fs = filesystem.promises;

import * as pm2 from 'pm2';

import { queryItemById, deleteItemById, returnTable } from "../database";
import { APPLICATIONS_TABLE, INDEPENDENT } from "../../environment";
import { deleteEverythingInDirectory } from "../utils/deleteDirectory";
import { applicationsPath } from "../utils/paths";

// first two process.argv variables are file paths, the rest are arguments passed to the script
// if the script is being run independently, it will have a 3rd argument equal to 'INDEPENDENT'
if(process.argv[2] === INDEPENDENT){
    const id = process.argv[3];

    if(id){
        deleteApplicationScript(id).then(res => console.log(res));
    }
    else{
        console.log('You must provide an application id in the command line.')
    }
    
}

export async function deleteApplicationScript(id){
    try{
        
        const application = await queryItemById(APPLICATIONS_TABLE, id);
    
        console.log('DELETING...');
        // delete application from database
        await deleteItemById(APPLICATIONS_TABLE, id);
        
    
    
        // delete the daemon running the application
        pm2.describe(application.id, (err, description) => {
            if(err){
                console.log('big time err')
                console.log(err);
            }
            if(description && description.length > 0){
                pm2.delete(application.id, (err) => {
                    if(err){
                        console.log('small time err')
                        console.log(err)
                    }
                });

            }
        })
        
    
        
        try{
            // delete application directory from applications folder
            await deleteEverythingInDirectory(`${applicationsPath}/${application.id}`);
        
            // clean up any directories that dont get deleted -- not sure how i feel about this; deleteEverythingInDirectory should delete everything in one pass
            
            if(await fs.readdir(`${applicationsPath}/${application.id}`)){
                await deleteEverythingInDirectory(`${applicationsPath}/${application.id}`);
            }
            await fs.rmdir(`${applicationsPath}/${application.id}`);
        }
        catch(e){
            console.log('ERROR ', e);
        }
        
        return {status:200, message:`${application.id} has been deleted`, table: await returnTable(APPLICATIONS_TABLE)};
    }
    catch(e){
        return {status:500, message:e};
    }
    
}