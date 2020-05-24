import * as path from 'path';

import { applicationsPath } from "../utils/paths";
import { createServingFile } from "../utils/createServingFile";
import { INDEPENDENT } from '../../environment';


// first two process.argv variables are file paths, the rest are arguments passed to the script
// if the script is being run independently, it will have a 3rd argument equal to 'INDEPENDENT'
if(process.argv[2] === INDEPENDENT){
    const applicationId = process.argv[3];
    const serveFrom = process.argv[4];
    const port = process.argv[5];
    const rerouteDefaultPathTo = process.argv[6];
    

    addServingFileScript(
        applicationId,
        serveFrom,
        rerouteDefaultPathTo,
        port
    ).then(res => {
        console.log(res);
        process.exit();
    });


}

export async function addServingFileScript(applicationId, serveFrom, port, rerouteDefaultPathTo){
    try{
        await createServingFile(
            path.join(applicationsPath, applicationId), 
            serveFrom, 
            rerouteDefaultPathTo, 
            port
        );
        return {status:200, message:'Serve file has been created.'};
    }
    catch(e){
        return {status:500, message:e};
    }
}