import * as path from 'path';

import { exec } from 'child_process';

import * as filesystem from 'fs'
const fs = filesystem.promises;

import * as pm2 from 'pm2';

import { returnTable, queryItemById, addToDatabase, deleteItemById } from './database';
import { deleteEverythingInDirectory } from './deleteDirectory';
import { createServingFile } from './createServingFile';



const applicationsPath = path.join(__dirname, '../../applications');


export async function getAllApplications(req, res){
    const table = await returnTable('applications');
    if(table){
        res.status(200).send({status:200, message:'QUERY EXECUTED SUCCESSFULLY', table});
    }
    else{
        res.status(404).send({status:404, message:'APPLICATIONS TABLE NOT FOUND'})
    }
}

export async function getApplicationById(req, res){
    const application = await queryItemById('applications', req.params.id);

    if(application){
        res.status(200).send({status:200, message:'QUERY EXECUTED SUCCESSFULLY', application});
    }
    else{
        res.status(404).send({status:404, message:'APPLICATION NOT FOUND'});
    }
}

export async function addApplication(req, res){
    await addToDatabase('applications', req.body);
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
                res.status(200).send({status:200, message:stderr});
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
    const applicationsInDatabase     = await returnTable('applications');

    const untrackedApplicationTitles = applicationsFolderContents.filter(appTitle => !applicationsInDatabase.some((dbApp:any) => dbApp.title === appTitle));
    untrackedApplicationTitles.forEach(
        async (untrackedAppTitle:string) => await addToDatabase('applications', {title:untrackedAppTitle})
    );
    
    res.status(200).send({status:200, message:`Added ${untrackedApplicationTitles.length} to application database`});
}

export async function applicationSetup(req, res){
    const { commands, application } = req.body;

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
    const application = await queryItemById('applications', id);

    console.log('DELETING...');
    // delete application from database
    await deleteItemById('applications', id);

    // delete application directory from applications folder
    await deleteEverythingInDirectory(`${applicationsPath}/${application.title}`);

    // clean up any directories that dont get deleted -- not sure how i feel about this; deleteEverythingInDirectory should delete everything in one pass
    try{
        if(await fs.readdir(`${applicationsPath}/${application.title}`)){
            await deleteEverythingInDirectory(`${applicationsPath}/${application.title}`);
        }
    }
    catch(e){
        console.log('ERROR ', e);
    }
    
    res.status(200).send({status:200, message:`${application.title} has been deleted`})
}

export async function startApplication(req, res){
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
    const {applicationPath, serveFrom, rerouteDefaultPathTo, port} = req.body;
    
    await createServingFile(applicationPath, serveFrom, rerouteDefaultPathTo, port);

    res.status(200).send({status:200, message:'Serve file has been created.'})
}