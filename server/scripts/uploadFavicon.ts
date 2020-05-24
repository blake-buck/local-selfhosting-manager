import * as path from 'path';
import * as filesystem from 'fs'
const fs = filesystem.promises;

import { applicationsPath } from '../utils/paths';
import { FAVICON, APPLICATIONS_TABLE } from '../../environment';
import { updateItemById, returnTable } from '../database';

export async function uploadFaviconScript(faviconData, applicationId){
    const faviconPath =  path.join(applicationsPath, applicationId, FAVICON);

    try{
        await fs.writeFile(
            faviconPath,
            faviconData,
            {encoding:'binary'}
        );
    
        await updateItemById(
            APPLICATIONS_TABLE,
            applicationId,
            {favicon:faviconPath.replace(/.+local-selfhosting-manager/, '')}
        );
    
        return {
            status:200, 
            message:`${applicationId} favicon is updated`,
            table: await returnTable(APPLICATIONS_TABLE)
        };
    }
    catch(e){
        return {status:500, message:e};
    }
}