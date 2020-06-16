export const RUNNING = 'RUNNING';
export const STOPPED = 'STOPPED';
export const UNCONFIGURED = 'UNCONFIGURED';

export const headers = {
    'Content-Type':'application/json'
}

import { renderApplicationCards } from './applications';
import { toggleSidebar, renderSidebar } from './sidebar';
import { renderDirectoryPicker } from './applicationDirectoryPicker';


window.addEventListener('load', async (e) => {

    // initially render application cards
    let applications: any = await fetch('/api/applications');
    applications = (await applications.json()).table;


    renderSidebar();
    
    renderApplicationCards(applications);

    // add event listeners to various buttons
    document.querySelector('#menuButton').addEventListener('click', toggleSidebar);
});