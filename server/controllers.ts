import * as path from 'path';

import { exec } from 'child_process';

import * as filesystem from 'fs'
const fs = filesystem.promises;

import { returnTable, queryItemById, addToDatabase, updateItemById } from './database';
import { OPERATING_SYSTEM, WINDOWS, FAVICON, APPLICATIONS_TABLE } from '../environment';
import { getWindowsUser } from './utils/getWindowsUser';
import { applicationsPath, rootDirectory } from './utils/paths';
import { refreshScript } from './scripts/refresh';
import { deleteApplicationScript } from './scripts/deleteApplication';
import { startApplicationScript } from './scripts/startApplication';
import { stopApplicationScript } from './scripts/stopApplication';
import { addServingFileScript } from './scripts/addServingFile';
import { addToStartupScript } from './scripts/addToStartup';
import { removeFromStartupScript } from './scripts/removeFromStartup';

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

    try{
        const { repoUrl } = req.body;

        exec(
            `git clone ${repoUrl}`, 
            {
                cwd:applicationsPath
            }, 
            async (err, stdout, stderr) => {
                if(err){
                    console.log("ERR", err);
                    res.status(400).send({status:400, message:err});
                }
                // Don't like how this feels, should get to the bottom of why Cloning into... is output through stderr
                else if(stderr.includes('Cloning into')){
                   await refresh(req, res);
                }
                else if(!stderr.includes('Cloning into')){
                    console.log("STDERR ", stderr);
                    
                    res.status(400).send({status:400, message:stderr});
                }
            }
        );

    }
    catch(e){
        res.status(500).send({status:500, message:e});
    }
    
}

export async function refresh(req, res){
    const result = await refreshScript();

    res.status(result.status).send(result);
}

export async function applicationSetup(req, res){
    try{
        const { commands, application } = req.body;

        // run the user given commands e.g. "npm install" in the selected application
        exec(
            commands, 
            {
                cwd:`${applicationsPath}/${application}`
            }, 
            async (err, stdout, stderr) => {
    
                if(err){
                    console.log("ERR", err);
                    res.status(400).send({status:400, message:err});
                }
    
                else if(stdout){
                    console.log("STDOUT", stdout)
                    res.status(200).send({status:200, message:stdout});
                }
    
                else if(stderr){
                    console.log("STDERR ", stderr);
                    
                    res.status(400).send({status:400, message:stderr});
                }
    
            }
        );
    }
    catch(e){
        res.status(500).send({status:500, message:e});
    }
    
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
    if(OPERATING_SYSTEM === WINDOWS){

        // Create a shortcut file on user desktop
        try{
            const username = await getWindowsUser();
            const { shortcutName, applicationId, port } = req.body;

            await updateItemById(APPLICATIONS_TABLE, applicationId, {shortcutPort:port})
            
            const shortcutPath = `C:\\Users\\${username}\\Desktop\\${shortcutName}.url`;
            
            let shortcutFileContents = `[InternetShortcut]\nURL=http://localhost:${port}`;

            // if the application has a favicon, add it to the shortcut
            const favicon = (await queryItemById(APPLICATIONS_TABLE, applicationId)).favicon;
            let iconFile = path.join(rootDirectory, favicon);

            if(favicon){
                shortcutFileContents += `\nIconIndex=0\nIconFile=${iconFile}`
            }

            await fs.writeFile(
                shortcutPath,

                shortcutFileContents,

                {encoding:'utf-8'}
            );

            res.status(200).send({status:200, message:'Shortcut added to user desktop.'});
        }
        catch(e){
            res.status(500).send({status:500, message:e})
        }
        
    }
    else{
        res.status(500).send({status:500, message:'Unrecognized operating system!'})
    }
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
        )
    
        res.status(200).send({
            status:200, 
            message:`${applicationId} favicon is updated`,
            table: await returnTable(APPLICATIONS_TABLE)
        });
    }
    catch(e){
        res.status(500).send({status:500, message:e})
    }

    
}