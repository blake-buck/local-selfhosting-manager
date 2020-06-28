import { openSnackbar } from "./snackbars";
import { openConfigDialog } from "./configDialog";
import { openConfirmationDialog } from "./confirmDeleteDialog";

import { handleResponse, CONSTANTS, headers} from "./service";
const {CLICK , STOPPED, UNCONFIGURED, RUNNING} = CONSTANTS;
const {RED} = CONSTANTS.SNACKBAR_COLORS;

// CSS class/id constants
const START_APPLICATION = 'startApplication';
const STOP_APPLICATION = 'stopApplication';
const CONFIGURE_APPLICATION = 'configureApplication';
const DELETE_APPLICATION = 'deleteApplication';

const applicationButtonHashMap = {
    [STOPPED]:`<button id='${START_APPLICATION}'>Start Application</button>`,
    [UNCONFIGURED]:`<button id='${START_APPLICATION}'>Start Application</button>`,
    [RUNNING]:`<button id='${STOP_APPLICATION}'>Stop Application</button>`,
};

// functions
const applicationDiv = () => document.querySelector('.application-cards');

function createCard(application:Application){
    // Create card wrapper
    const card = document.createElement('div');
    card.classList.add('card');
    card.classList.add('center-column-layout');
    card.id = application.id;

    // initialize innerHTML to be blank
    card.innerHTML = '';


    // if the application has a favicon, add a media element to the card
    if(application.favicon){
        card.innerHTML += 
        `
        <div class='card-media'> 
            <a href='${application.shortcutPort ? `http://localhost:${application.shortcutPort}` : '#'}' target='${application.shortcutPort ? '_blank' : '_self'}'>
                <img src='${application.favicon.replace(/\\/g, '/')}' alt='card media' />
            </a>
        </div>
        `
    }

    // add the application title 
    card.innerHTML += 
    `
    <header>
        <span>${application.id}</span>
    </header>
    `;

    // if application has a status, add it to the card
    if(application.status){
        card.innerHTML +=
        `
        <div class='application-status'>
            <span class='${application.status}'>${application.status}</span>
        </div>
        `
    }

    // add action buttons to the card
    card.innerHTML +=
    `
    <footer class='center-column-layout'>
        ${applicationButtonHashMap[application.status]}
        <button id='${CONFIGURE_APPLICATION}'>Configure Application</button>
        <button id='${DELETE_APPLICATION}'>Delete Application</button>
    </footer>
    `

    // add event listeners to card buttons
    card.querySelector(`#${START_APPLICATION}`)?.addEventListener(CLICK, () => startApplication(application));
    card.querySelector(`#${STOP_APPLICATION}`)?.addEventListener(CLICK, () => stopApplication(application));

    card.querySelector(`#${CONFIGURE_APPLICATION}`).addEventListener(CLICK, () => openConfigDialog(application));
    card.querySelector(`#${DELETE_APPLICATION}`).addEventListener(CLICK, () => openConfirmationDialog(application));

    return card;
}


export function renderApplicationCards(applications:Application[]){
    // clear out old application cards
    applicationDiv().innerHTML = '';

    // loop through applications and add cards to DOM
    applications.forEach(application => applicationDiv().appendChild(createCard(application)));
}

export async function refreshApplications(){
    // check the applications folder for user added apps
    const request: any = await fetch(
        '/api/applications/refresh', 
        { method:'POST' }
    );
    const response = await request.json();

    const applications = response.table;
    
    handleResponse(response, () => renderApplicationCards(applications))
}

export async function deleteApplication(id:string){
    const request: any = await fetch(
        `/api/application/${id}`, 
        { method:'DELETE' }
    );
    const response = await request.json();

    const applications = response.table;

    handleResponse(response, () => renderApplicationCards(applications));
}

export async function startApplication(application:Application, scriptArgs?:string){
    if(application.status === UNCONFIGURED){
        return openSnackbar('You need to define an application start script first!', RED);
    }

    const request = await fetch(
        '/api/application/start',
        {
            method:'POST',
            body:JSON.stringify({
                applicationName:application.id,
                startScript:application.startScript,
                scriptArgs:scriptArgs ? scriptArgs : ''
            }),
            headers
        }
    );
    const response = await request.json();

    handleResponse(response, () => renderApplicationCards(response.table));
}

export async function stopApplication(application:Application){
    const request = await fetch(
        '/api/application/stop',
        {
            method:'POST',
            body:JSON.stringify({
                applicationName:application.id
            }),
            headers
        }
    );
    const response = await request.json();

    handleResponse(response, () => renderApplicationCards(response.table));
}