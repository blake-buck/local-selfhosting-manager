import { headers } from "./index";
import { openCloningDialog } from "./cloningDialog";
import { refreshApplications } from "./applications";
import { openSnackbar } from "./snackbars";

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
        <button id='menuButton'>&#8801;</button>
    </header>
    <span>
        ${startupButton.element}
        <button id='refreshApplications'>Refresh</button>
        <button id='openCloningDialog'>Clone</button>
    </span>
    `

    sidebarWrapper.querySelector('#menuButton').addEventListener('click', toggleSidebar);
    
    if(startupButton.autostart){
        sidebarWrapper.querySelector('#removeFromStart').addEventListener('click', () => stopAutoStartApplications());
    }
    else{
        sidebarWrapper.querySelector('#addToStart').addEventListener('click', () => autoStartApplications());
    }

    sidebarWrapper.querySelector('#openCloningDialog').addEventListener('click', openCloningDialog);
    sidebarWrapper.querySelector('#refreshApplications').addEventListener('click', refreshApplications);
    
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

    if(autostart.item){
        return {autostart:autostart.item, element:`<button id='removeFromStart'>Stop Applications Autostart</button>`};
    }
    
    return {autostart:autostart.item, element:`<button id='addToStart'>Autostart Applications</button>`};
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

    console.log(response);
    if(response.status === 200){
        openSnackbar(response.message, 'green', 5000);
    }
    else{
        openSnackbar(response.message, 'red', 5000);
    }

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

    console.log(response);

    if(response.status === 200){
        openSnackbar(response.message, 'green', 5000);
    }
    else{
        openSnackbar(response.message, 'red', 5000);
    }

    await renderSidebar();
}