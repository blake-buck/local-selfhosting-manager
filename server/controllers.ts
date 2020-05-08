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
import { applicationsPath } from './utils/paths';
import { findFavicon } from './utils/findFavicon';


const APPLICATIONS_TABLE = 'applications';

export async function getAllApplications(req, res){
    const table = await returnTable(APPLICATIONS_TABLE);
    if(table){
        res.status(200).send({status:200, message:'QUERY EXECUTED SUCCESSFULLY', table});
    }
    else{
        res.status(404).send({status:404, message:'APPLICATIONS TABLE NOT FOUND'})
    }
}

export async function getApplicationById(req, res){
    const application = await queryItemById(APPLICATIONS_TABLE, req.params.id);

    if(application){
        res.status(200).send({status:200, message:'QUERY EXECUTED SUCCESSFULLY', application});
    }
    else{
        res.status(404).send({status:404, message:'APPLICATION NOT FOUND'});
    }
}

export async function addApplication(req, res){
    await addToDatabase(APPLICATIONS_TABLE, req.body.title, req.body);
    res.status(200).send({status:200, message:'ALL GOOD'});
}

export async function cloneRepo(req, res){
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
            if(stderr.includes('Cloning into')){
               await refresh(req, res)
            }
            if(!stderr.includes('Cloning into')){
                console.log("STDERR ", stderr);
                
                res.status(400).send({status:400, message:stderr});
            }
        }
    );
}

export async function refresh(req, res){
    const applicationsFolderContents = await fs.readdir(applicationsPath);
    const applicationsInDatabase     = await returnTable(APPLICATIONS_TABLE);

    // if the app is in the applications folder and not in the database, add to database
    const untrackedApplicationTitles = applicationsFolderContents.filter(appTitle => !applicationsInDatabase.some((dbApp:any) => dbApp.title === appTitle));
    
    for(let i=0; i < untrackedApplicationTitles.length; i++){
        const untrackedAppTitle = untrackedApplicationTitles[i];
        await addToDatabase(APPLICATIONS_TABLE, untrackedAppTitle, {title:untrackedAppTitle, favicon: await findFavicon(untrackedAppTitle)})
    }
    
    res.status(200).send({status:200, message:`Added ${untrackedApplicationTitles.length} to application database`, table: await returnTable(APPLICATIONS_TABLE)});
}

export async function applicationSetup(req, res){
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

export async function deleteApplication(req, res){
    const { id } = req.params;
    const application = await queryItemById(APPLICATIONS_TABLE, id);

    console.log('DELETING...');
    // delete application from database
    await deleteItemById(APPLICATIONS_TABLE, id);
    

    // delete application directory from applications folder
    await deleteEverythingInDirectory(`${applicationsPath}/${application.title}`);

    // stop the daemon running the application
    pm2.stop(application.id, (err) => {
        if(err){
            console.log(err)
        }
    });

    // clean up any directories that dont get deleted -- not sure how i feel about this; deleteEverythingInDirectory should delete everything in one pass
    try{
        if(await fs.readdir(`${applicationsPath}/${application.title}`)){
            await deleteEverythingInDirectory(`${applicationsPath}/${application.title}`);
        }
    }
    catch(e){
        console.log('ERROR ', e);
    }
    
    res.status(200).send({status:200, message:`${application.title} has been deleted`, table: await returnTable(APPLICATIONS_TABLE)})
}

export async function startApplication(req, res){
    // daemonize given application
    const { applicationPath, applicationName, startScript, scriptArgs } = req.body;
    
    pm2.start(
        {
            name:   applicationName,
            script: startScript,
            args:   scriptArgs,
            cwd:    path.join(__dirname, `../../applications/${applicationPath}`)
        },
        (err, proc) => {
            if(err){
                console.log(err);
                res.status(500).send({status:500, message:`Error starting ${applicationName}`});
            }
            else if(proc){
                res.status(200).send({status:200, message:`${applicationName} is started!`})
            }
        }
    );
}

export async function stopApplication(req, res){
    // stop application daemon
    const { applicationName } = req.body;

    pm2.stop(applicationName, (err, proc) => {
        if(err){
            console.log(err);
            res.status(500).send({status:500, message:`Error stopping ${applicationName}`});
        }
        else if(proc){
            res.status(200).send({status:200, message:`${applicationName} is stopped!`})
        }
    })
}

export async function addServingFile(req, res){
    // adds http server file to given application
    const {applicationPath, serveFrom, rerouteDefaultPathTo, port} = req.body;
    
    await createServingFile(applicationPath, serveFrom, rerouteDefaultPathTo, port);

    res.status(200).send({status:200, message:'Serve file has been created.'})
}

export async function autoRestartApplications(req, res){
    // creates a pm2 dump file containing the current running applications
    pm2.dump(
        (err, result) => {
            if(err){
                console.log(err);
                res.status(500).send({status:500, message:'An error occured. Check that there are running applications.'})
            }
            else if(result){
                res.status(200).send({status:200, message:'Running applications are set to restart on a computer reboot.'});
            }
        }
    )
    
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
            const { shortcutName, shortcutUrl, applicationId } = req.body;
            
            const shortcutPath = `C:\\Users\\${username}\\Desktop\\${shortcutName}.url`;
            
            let shortcutFileContents = `[InternetShortcut]\nURL=${shortcutUrl}`;

            // if the application has a favicon, add it to the shortcut
            const favicon = (await queryItemById(APPLICATIONS_TABLE, applicationId)).favicon;
            if(favicon){
                shortcutFileContents += `\nIconIndex=0\nIconFile=${favicon}`
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
    const { id } = req.params;
    const { updatedValues } = req.body;

    await updateItemById(APPLICATIONS_TABLE, id, updatedValues);

    res.status(200).send({status:200, message:`${id} has been updated.`})
}