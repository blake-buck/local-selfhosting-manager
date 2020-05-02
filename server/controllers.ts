import * as path from 'path';

import { exec } from 'child_process';

import * as filesystem from 'fs'
const fs = filesystem.promises;

import { returnTable, queryItemById, addToDatabase } from './database';

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
            cwd:path.join(__dirname, `../../applications/${application}`)
        }, 
        async (err, stdout, stderr) => {

            if(err){
                console.log("ERR", err);
                res.status(400).send({status:400, message:err});
            }

            if(stdout){
                console.log("STDOUT", stdout)
                res.status(200).send({status:200, message:stdout});
            }

            if(stderr){
                console.log("STDERR ", stderr);
                
                res.status(400).send({status:400, message:stderr});
            }

        }
    );
}