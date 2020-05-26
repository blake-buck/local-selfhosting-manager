export const RUNNING = 'RUNNING';
export const STOPPED = 'STOPPED';
export const UNCONFIGURED = 'UNCONFIGURED';

export const headers = {
    'Content-Type':'application/json'
}

// import './applications';
// import './cloningDialog';
// import './configDialog';
// import './confirmDeleteDialog';
// import './sidebar';
// import './snackbars';
import { renderApplicationCards, refreshApplications, stopAutoStartApplications, autoStartApplications } from './applications';
import { toggleSidebar } from './sidebar';
import { openCloningDialog } from './cloningDialog';


window.addEventListener('load', async (e) => {

    // initially render application cards
    let applications: any = await fetch('/api/applications');
    applications = (await applications.json()).table;

    renderApplicationCards(applications);

    // add event listeners to various buttons
    document.querySelector('#openCloningDialog').addEventListener('click', openCloningDialog);

    document.querySelector('#refreshApplications').addEventListener('click', refreshApplications);

    document.querySelector('#removeFromStart').addEventListener('click', () => stopAutoStartApplications());
    document.querySelector('#addToStart').addEventListener('click', () => autoStartApplications());

    document.querySelectorAll('#menuButton').forEach(node => node.addEventListener('click', toggleSidebar));
});