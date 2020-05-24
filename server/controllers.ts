import { returnTable, queryItemById, addToDatabase, updateItemById } from './database';
import { APPLICATIONS_TABLE } from '../environment';
import { refreshScript } from './scripts/refresh';
import { deleteApplicationScript } from './scripts/deleteApplication';
import { startApplicationScript } from './scripts/startApplication';
import { stopApplicationScript } from './scripts/stopApplication';
import { addServingFileScript } from './scripts/addServingFile';
import { addToStartupScript } from './scripts/addToStartup';
import { removeFromStartupScript } from './scripts/removeFromStartup';
import { uploadFaviconScript } from './scripts/uploadFavicon';
import { createShortcutScript } from './scripts/createShortcut';
import { cloneRepoScript } from './scripts/cloneRepo';
import { applicationSetupScript } from './scripts/applicationSetup';

export async function getAllApplications(req, res){

    try{

        const table = await returnTable(APPLICATIONS_TABLE);

        if(table){
            res.status(200).send({status:200, message:'QUERY EXECUTED SUCCESSFULLY', table});
        }
        else{
            res.status(404).send({status:404, message:'APPLICATIONS TABLE NOT FOUND'})
        }

    }
    catch(e){
        res.status(500).send({status:500, message:e});
    }
    
}

export async function getApplicationById(req, res){

    try{

        const application = await queryItemById(APPLICATIONS_TABLE, req.params.id);

        if(application){
            res.status(200).send({status:200, message:'QUERY EXECUTED SUCCESSFULLY', application});
        }
        else{
            res.status(404).send({status:404, message:'APPLICATION NOT FOUND'});
        }

    }
    catch(e){
        res.status(500).send({status:500, message:e});
    }
    
}

export async function addApplication(req, res){

    try{
        await addToDatabase(APPLICATIONS_TABLE, req.body.id, req.body);
        res.status(200).send({status:200, message:'ALL GOOD'});
    }
    catch(e){
        res.status(500).send({status:500, message:e});
    }
    
}

export async function cloneRepo(req, res){
    const { repoUrl } = req.body;

    const result:any = await cloneRepoScript(repoUrl);

    if(result.status === 200){
        await refresh(req, res);
    }
    else{
        res.status(result.status).send(result);
    }
}

export async function refresh(req, res){
    const result = await refreshScript();

    res.status(result.status).send(result);
}

export async function applicationSetup(req, res){
    const { commands, application } = req.body;
    
    const result:any = await applicationSetupScript(commands, application);

    res.status(result.status).send(result);
}

export async function deleteApplication(req, res){
    const { id } = req.params;

    const result = await deleteApplicationScript(id);

    res.status(result.status).send(result);
}

export async function startApplication(req, res){
    const { applicationPath, applicationName, startScript, scriptArgs } = req.body;

    const result:any = await startApplicationScript(applicationName, applicationPath, startScript, scriptArgs);

    res.status(result.status).send(result);    
}

export async function stopApplication(req, res){
    // stop application daemon
    const { applicationName } = req.body;

    const result:any = await stopApplicationScript(applicationName);

    res.status(result.status).send(result);
}

export async function addServingFile(req, res){
    // adds http server file to given application
    const {applicationId, serveFrom, rerouteDefaultPathTo, port} = req.body;

    const result = await addServingFileScript(applicationId, serveFrom, port, rerouteDefaultPathTo);

    res.status(result.status).send(result);
}

export async function addToStartup(req, res){
    const result = await addToStartupScript();
    
    res.status(result.status).send(result);
}

export async function removeFromStartup(req, res){
    const result = await removeFromStartupScript();
    
    res.status(result.status).send(result);
}

export async function createShortcut(req, res){
    const { shortcutName, applicationId, port } = req.body;

    const result = await createShortcutScript(shortcutName, applicationId, port);

    res.status(result.status).send(result);
}

export async function updateApplication(req, res){
    try{
        const { id } = req.params;
        const { updatedValues } = req.body;
    
        await updateItemById(APPLICATIONS_TABLE, id, updatedValues);
        const table = await returnTable(APPLICATIONS_TABLE);
        res.status(200).send({status:200, message:`${id} has been updated.`, table});
    }
    catch(e){
        res.status(500).send({status:500, message:e});
    }
    
}

export async function uploadFavicon(req, res){
    const { faviconData, applicationId } = req.body;

    const result = await uploadFaviconScript(faviconData, applicationId);

    res.status(result.status).send(result);    
}