import { openCloningDialog } from "./cloningDialog";
import { refreshApplications } from "./applications";

import { handleResponse, CONSTANTS, headers } from "./service";
const {CLICK} = CONSTANTS;

// CSS class/id constants
const MENU_BUTTON = 'menuButton';
const MENU_BUTTON_ID = `#${MENU_BUTTON}`;

const REFRESH_APPLICATIONS = 'refreshApplications';
const REFRESH_APPLICATIONS_ID = `#${REFRESH_APPLICATIONS}`;

const OPEN_CLONING_DIALOG = 'openCloningDialog';
const OPEN_CLONING_DIALOG_ID = `#${OPEN_CLONING_DIALOG}`

const REMOVE_FROM_START = 'removeFromStart';
const REMOVE_FROM_START_ID = `#${REMOVE_FROM_START}`;

const ADD_TO_START = 'addToStart';
const ADD_TO_START_ID = `#${ADD_TO_START}`;

// functions
export async function renderSidebar(){
    let sidebarWrapper = document.querySelector('div.sidebar');
    let isCreated = false;

    if(!sidebarWrapper){
        sidebarWrapper = document.createElement('div');
        sidebarWrapper.classList.add('sidebar');
        sidebarWrapper.classList.add('closed');

        isCreated = true;
    }

    const startupButton = await startupActions();

    sidebarWrapper.innerHTML =`
    <header>
        <button id='${MENU_BUTTON}'>&#8801;</button>
    </header>
    <span>
        ${startupButton.element}
        <button id='${REFRESH_APPLICATIONS}'>Refresh</button>
        <button id='${OPEN_CLONING_DIALOG}'>Clone</button>
    </span>`;

    sidebarWrapper.querySelector(MENU_BUTTON_ID).addEventListener(CLICK, toggleSidebar);
    
    if(startupButton.autostart){
        sidebarWrapper.querySelector(REMOVE_FROM_START_ID).addEventListener(CLICK, () => stopAutoStartApplications());
    }
    else{
        sidebarWrapper.querySelector(ADD_TO_START_ID).addEventListener(CLICK, () => autoStartApplications());
    }

    sidebarWrapper.querySelector(OPEN_CLONING_DIALOG_ID).addEventListener(CLICK, openCloningDialog);
    sidebarWrapper.querySelector(REFRESH_APPLICATIONS_ID).addEventListener(CLICK, refreshApplications);
    
    if(isCreated){
        document.body.appendChild(sidebarWrapper);
    }
    
}

export async function startupActions(){
    const request = await fetch(
        '/api/getItem/autostart',
        {
            method:'GET',
            headers
        }
    );
    const autostart = await request.json();
    
    return {
        autostart:autostart.item, 
        element: autostart.item ? `<button id='${REMOVE_FROM_START}'>Stop Applications Autostart</button>` : `<button id='${ADD_TO_START}'>Autostart Applications</button>`
    };
}

export function toggleSidebar(){
    document.querySelector('.sidebar').classList.toggle('closed');
}

export async function autoStartApplications(){
    const request = await fetch(
        '/api/startup/add',
        {
            method:'POST'
        }
    );
    const response = await request.json();

    handleResponse(response);

    await renderSidebar();
}

export async function stopAutoStartApplications(){
    const request = await fetch(
        '/api/startup/remove',
        {
            method:'POST'
        }
    );
    const response = await request.json();

    handleResponse(response);

    await renderSidebar();
}