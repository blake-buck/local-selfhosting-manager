import { STOPPED, UNCONFIGURED, RUNNING, headers } from "./index";
import { openSnackbar } from "./snackbars";
import { openConfigDialog } from "./configDialog";
import { openConfirmationDialog } from "./confirmDeleteDialog";

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
        ${application.status === STOPPED ? `<button id='startApplication'>Start Application</button>` : ''}
        ${application.status === UNCONFIGURED ? `<button id='startApplication'>Start Application</button>` : ''}
        ${application.status === RUNNING ? `<button id='stopApplication'>Stop Application</button>` : ''}
        <button id='configureApplication'>Configure Application</button>
        <button id='deleteApplication'>Delete Application</button>
    </footer>
    `

    // add event listeners to card buttons
    card.querySelector('#startApplication')?.addEventListener('click', () => startApplication(application))
    card.querySelector('#stopApplication')?.addEventListener('click', () => stopApplication(application))
    card.querySelector('#configureApplication').addEventListener('click', () => {
        openConfigDialog(application);
    });
    card.querySelector('#deleteApplication').addEventListener('click', () => openConfirmationDialog(application));

    return card;
}


export function renderApplicationCards(applications:Application[]){
    // clear out old application cards
    applicationDiv().innerHTML = '';

    // loop through applications and add cards to DOM
    applications.forEach(
        application => {
            applicationDiv().appendChild(
                createCard(application)
            );
        }
    );
}

export async function refreshApplications(){
    // check the applications folder for user added apps
    const request: any = await fetch(
        '/api/applications/refresh', 
        { method:'POST' }
    );
    
    const response = await request.json();

    const applications = response.table;
    
    if(response.status === 200){
        renderApplicationCards(applications);
        
        openSnackbar(response.message, 'green', 5000);
    }
    else{
        openSnackbar(response.message, 'red', 5000);
    }

}

export async function deleteApplication(id:string){
    let request: any = await fetch(
        `/api/application/${id}`, 
        { method:'DELETE' }
    );

    let response = await request.json();
    console.log(response);
    const applications = response.table;

    if(response.status === 200){
        renderApplicationCards(applications);
        openSnackbar(response.message, 'green', 5000);
    }
    else{
        openSnackbar(response.message, 'red', 5000);
    }
}

export async function startApplication(application:Application, scriptArgs?:string){
    if(application.status === UNCONFIGURED){
        return openSnackbar('You need to define an application start script first!', 'red');
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

    console.log(response);
    if(response.status === 200){
        renderApplicationCards(response.table);

        openSnackbar(response.message, 'green', 5000);
    }
    else{
        openSnackbar(response.message, 'red', 5000);
    }
    
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

    console.log(response);
    if(response.status === 200){
        renderApplicationCards(response.table);

        openSnackbar(response.message, 'green', 5000);
    }
    else{
        openSnackbar(response.message, 'red', 5000);
    }
    

}