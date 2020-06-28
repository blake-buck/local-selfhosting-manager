import {renderApplicationCards} from './applications';

import { CONSTANTS, headers} from "./service";
const {CLICK} = CONSTANTS;

// CSS class/id constants
const CLOSE_CLONING_DIALOG = 'closeCloningDialog';
const CLOSE_CLONING_DIALOG_ID = `#${CLOSE_CLONING_DIALOG}`;

const CLONE_REPOSITORY = 'cloneRepository';
const CLONE_REPOSITORY_ID = `#${CLONE_REPOSITORY}`;

const REPO_URL = 'repoUrl';
const REPO_URL_ID = `#${REPO_URL}`;

const CLONE_APP_DIALOG_BACKDROP = 'clone-app-dialog-backdrop';
const CLONE_APP_DIALOG_BACKDROP_CLASS = `.${CLONE_APP_DIALOG_BACKDROP}`;

const STEP_ONE = 'step-1';
const STEP_ONE_CLASS = `.${STEP_ONE}`;

const STEP_TWO = 'step-2';
const STEP_TWO_CLASS = `.${STEP_TWO}`;

const STEP_THREE = 'step-3';
const STEP_THREE_CLASS = `.${STEP_THREE}`;

const CENTER_COLUMN_LAYOUT = 'center-column-layout';

// functions
export function openCloningDialog(){
    initializeCloningDialog();

    // display the dialog on step 1 
    renderStepOne();
    
    document.querySelector(`${STEP_ONE_CLASS} ${CLOSE_CLONING_DIALOG_ID}`).addEventListener(CLICK, closeCloningDialog);

    document.querySelector(CLONE_REPOSITORY_ID).addEventListener(CLICK, () => {
        // pull the user entered text from dialog input
        const repoInput:InputElement = document.querySelector(REPO_URL_ID);
        const repoUrl = repoInput.value;
        cloneRepository(repoUrl);
    });

}

async function closeCloningDialog(){
    // May need to removeEvent listeners when dialog is closed
    document.body.removeChild(document.querySelector(CLONE_APP_DIALOG_BACKDROP_CLASS));
}

async function cloneRepository(repoUrl:string){
    // if the user has entered something into the field, continue
    if(repoUrl){
        // move from step 1 (enter repo URL) to step 2 (loading screen)
        renderStepTwo();

        document.querySelector(`${STEP_TWO_CLASS} ${CLOSE_CLONING_DIALOG_ID}`).addEventListener(CLICK, closeCloningDialog);

        const request: any = await fetch(
            '/api/application/clone', 
            {
                method:'POST',
                body:JSON.stringify({repoUrl}),
                headers
            }
        );
        const response = await request.json();
    
        // once a response is received, move from step 2 to step 3
        if(response.status === 200){
            renderStepThree(false);
        
            // get an updated list of applications and rerender cards
            const request = await fetch('/api/applications');
            const response = await request.json();

            const applications = response.table;
            renderApplicationCards(applications);
        }
        else{
            renderStepThree(true);
        }

        document.querySelector(`${STEP_THREE_CLASS} ${CLOSE_CLONING_DIALOG_ID}`).addEventListener(CLICK, closeCloningDialog);
    }

}

function dialogWrapper(contents:string){
    return `
    <div class='${CLONE_APP_DIALOG_BACKDROP}'>
        <div class='clone-app-dialog dialog-body'>
            ${contents}
        </div>
    </div>
    `
}

function initializeCloningDialog(){
    document.body.insertAdjacentHTML('beforeend', dialogWrapper(''));
}

function reRenderCloningDialog(contents){
    const dialog = document.querySelector(CLONE_APP_DIALOG_BACKDROP_CLASS);
    
    if(dialog){
        dialog.innerHTML = dialogWrapper(contents);
    }
}

function renderStepOne(){
    reRenderCloningDialog(`
    <div class='${CENTER_COLUMN_LAYOUT} ${STEP_ONE}'>
        <h3>Clone Git Repository</h3>
        <input id='${REPO_URL}' placeholder='Repo URL' />
        <span>
            <button id='${CLOSE_CLONING_DIALOG}'>Close</button>
            <button id='${CLONE_REPOSITORY}'>Clone</button>
        </span>
    </div>
    `);
}

function renderStepTwo(){
    reRenderCloningDialog(`
    <div class='${CENTER_COLUMN_LAYOUT} ${STEP_TWO}'>
        <h3>Cloning</h3>
        <div class='spinner'></div>
        <span>
            <button id='${CLOSE_CLONING_DIALOG}'>Close</button>
        </span>
    </div>
    `);
}

function renderStepThree(failure:boolean){
    let resultMessage = failure ? `<h3>Failure</h3><p>&#10006;</p>` : `<h3>Success</h3><p>&#10004;</p>`;
    
    let template = `
    <div class='${CENTER_COLUMN_LAYOUT} ${STEP_THREE}'>
        ${resultMessage}
        <span>
            <button id='${CLOSE_CLONING_DIALOG}'>Close</button>
        </span>
    </div>
    `;

    reRenderCloningDialog(template);
}