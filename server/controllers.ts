import * as path from 'path';

import { exec } from 'child_process';

import * as filesystem from 'fs'
const fs = filesystem.promises;

import * as pm2 from 'pm2';

import { returnTable, queryItemById, addToDatabase, deleteItemById, updateItemById } from './database';
import { deleteEverythingInDirectory } from './utils/deleteDirectory';
import { createServingFile } from './utils/createServingFile';
import { OPERATING_SYSTEM } from '../environment';
import { getWindowsUser } from './utils/getWindowsUser';
import { applicationsPath, rootDirectory } from './utils/paths';
import { findFavicon } from './utils/findFavicon';
import { autoRestartApplications } from './utils/autoRestartApplications';


const APPLICATIONS_TABLE = 'applications';

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
                cwd:path.join(__dirname, '../../applications')
            }, 
            async (err, stdout, stderr) => {
                if(err){
                    console.log("ERR", err);
                    res.status(400).send({status:400, message:err});
                }
                // Don't like how this feels, should get to the bottom of why Cloning into... is output through stderr
                else if(stderr.includes('Cloning into')){
                   await refresh(req, res)
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

    try{
        const applicationsFolderContents = await fs.readdir(applicationsPath);
        const applicationsInDatabase     = await returnTable(APPLICATIONS_TABLE);
    
        // if the app is in the applications folder and not in the database, add to database
        const untrackedApplicationTitles = applicationsFolderContents.filter(appTitle => !applicationsInDatabase.some((dbApp:any) => dbApp.id === appTitle));
        
        for(let i=0; i < untrackedApplicationTitles.length; i++){
            const untrackedAppTitle = untrackedApplicationTitles[i];
            await addToDatabase(APPLICATIONS_TABLE, untrackedAppTitle, {favicon: await findFavicon(untrackedAppTitle), status:'UNCONFIGURED'})
        }
        
        res.status(200).send({status:200, message:`Added ${untrackedApplicationTitles.length} new apps to application database.`, table: await returnTable(APPLICATIONS_TABLE)});
    }
    catch(e){
        res.status(500).send({status:500, message:e});
    }
    
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
    try{
        const { id } = req.params;
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
        
        res.status(200).send({status:200, message:`${application.id} has been deleted`, table: await returnTable(APPLICATIONS_TABLE)});
    }
    catch(e){
        res.status(500).send({status:500, message:e});
    }
    
}

export async function startApplication(req, res){
    try{
        // daemonize given application
        const { applicationPath, applicationName, startScript, scriptArgs } = req.body;
        
        pm2.start(
            {
                name:   applicationName,
                script: startScript,
                args:   scriptArgs,
                cwd:    path.join(__dirname, `../../applications/${applicationPath}`)
            },
            async (err, proc) => {
                if(err){
                    console.log(err);
                    res.status(500).send({status:500, message:`Error starting ${applicationName}`});
                }
                else if(proc){

                    try{
                        await autoRestartApplications();
                        await updateItemById(APPLICATIONS_TABLE, applicationName, {status:'RUNNING'});
                        res.status(200).send({status:200, message:`${applicationName} is started!`, table: await returnTable(APPLICATIONS_TABLE)});
                    }
                    catch(e){
                        res.status(500).send({status:500, message:e})
                    }
                    
                }
            }
        );
    }
    catch(e){
        res.status(500).send({status:500, message:e});
    }
    
}

export async function stopApplication(req, res){
    try{
        // stop application daemon
        const { applicationName } = req.body;

        pm2.stop(applicationName, async (err, proc) => {
            if(err){
                console.log(err);
                res.status(500).send({status:500, message:`Error stopping ${applicationName}`});
            }
            else if(proc){
                try{
                    await autoRestartApplications();
                    await updateItemById(APPLICATIONS_TABLE, applicationName, {status:'STOPPED'});
                    res.status(200).send({status:200, message:`${applicationName} is stopped!`, table: await returnTable(APPLICATIONS_TABLE)});
                }
                catch(e){
                    res.status(500).send({status:500, message:e});
                }
            }
        });
    }
    catch(e){
        res.status(500).send({status:500, message:e});
    }
    
}

export async function addServingFile(req, res){
    try{
        // adds http server file to given application
        const {applicationId, serveFrom, rerouteDefaultPathTo, port} = req.body;

        await createServingFile(path.join(applicationsPath, applicationId), serveFrom, rerouteDefaultPathTo, port);

        res.status(200).send({status:200, message:'Serve file has been created.'});
    }
    catch(e){
        res.status(500).send({status:500, message:e});
    }
    
}

export async function addToStartup(req, res){
    if(OPERATING_SYSTEM === 'WINDOWS'){

        // add a batch file to windows startup that runs pm2 resurrect 
        try{
            const username = await getWindowsUser();

            await fs.writeFile(
                `C:\\Users\\${username}\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Startup\\local-selfhosting-manager-reboot.bat`,
                
                'pm2 resurrect',
                
                {encoding:'utf8'}
            );

            res.status(200).send({status:200, message:'Applications will restart whenever computer is rebooted.'});
        }
        catch(e){
            res.status(500).send({status:500, message:e})
        }

    }
    else{
        res.status(500).send({status:500, message:'Unrecognized operating system!'})
    }
    
}

export async function removeFromStartup(req, res){
    if(OPERATING_SYSTEM === 'WINDOWS'){

        // remove pm2 resurrect batch file from windows startup
        try{
            const username = await getWindowsUser();
            const startupFilePath = `C:\\Users\\${username}\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Startup\\local-selfhosting-manager-reboot.bat`;
    
            try{
                await fs.unlink(startupFilePath);
            }
            catch(e){
                console.log(e);
            }
            
            res.status(200).send({status:200, message:'Applications will not restart whenever computer is rebooted.'});

        }
        catch(e){
            res.status(500).send({status:500, message:e});
        }
    }
    else{
        res.status(500).send({status:500, message:'Unrecognized operating system!'})
    }
    
}

export async function createShortcut(req, res){
    if(OPERATING_SYSTEM === 'WINDOWS'){

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