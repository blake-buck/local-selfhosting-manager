const applicationDiv = () => document.querySelector('.application-cards');

function createCard(application:Application){
    // Create card wrapper
    const card = document.createElement('div');
    card.classList.add('card');
    card.id = application.id;

    // initialize innerHTML to be blank
    card.innerHTML = '';


    // if the application has a favicon, add a media element to the card
    if(application.favicon){
        card.innerHTML += 
        `
        <div class='card-media'> 
            <img src='${application.favicon.replace(/\\/g, '/')}' alt='card media' />
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
    <footer>
        <button id='startApplication'>Start Application</button>
        <button id='stopApplication'>Stop Application</button>
        <button id='configureApplication'>Configure Application</button>
        <button>Create Shortcut</button>
        <button id='deleteApplication'>Delete Application</button>
    </footer>
    `

    // add event listeners to card buttons
    card.querySelector('#startApplication').addEventListener('click', () => startApplication(application))
    card.querySelector('#stopApplication').addEventListener('click', () => stopApplication(application))
    card.querySelector('#configureApplication').addEventListener('click', () => {
        openConfigDialog(application);
    });
    card.querySelector('#deleteApplication').addEventListener('click', () => {
        deleteApplication(application.id)
    });

    return card;
}


function renderApplicationCards(applications:Application[]){
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

async function refreshApplications(){
    // check the applications folder for user added apps
    let response: any = await fetch(
        '/api/applications/refresh', 
        { method:'POST' }
    );

    const applications = (await response.json()).table;
    
    renderApplicationCards(applications);
}

async function deleteApplication(id:string){
    let request: any = await fetch(
        `/api/application/${id}`, 
        { method:'DELETE' }
    );

    let response = await request.json();
    console.log(response);
    const applications = response.table;

    renderApplicationCards(applications);
}

async function startApplication(application:Application, scriptArgs?:string){
    const request = await fetch(
        '/api/application/start',
        {
            method:'POST',
            body:JSON.stringify({
                applicationPath:application.id,
                applicationName:application.id,
                startScript:application.startScript,
                scriptArgs:scriptArgs ? scriptArgs : ''
            }),
            headers:{
                'Content-Type':'application/json'
            }
        }
    );

    const response = await request.json();

    console.log(response);
    renderApplicationCards(response.table);
}

async function stopApplication(application:Application){
    const request = await fetch(
        '/api/application/stop',
        {
            method:'POST',
            body:JSON.stringify({
                applicationName:application.id
            }),
            headers:{
                'Content-Type':'application/json'
            }
        }
    );

    const response = await request.json();

    console.log(response);
    renderApplicationCards(response.table);

}

async function autoStartApplications(){
    const request = await fetch(
        '/api/startup/add',
        {
            method:'POST'
        }
    );

    const response = await request.json();

    console.log(response);
}

async function stopAutoStartApplications(){
    const request = await fetch(
        '/api/startup/remove',
        {
            method:'POST'
        }
    );

    const response = await request.json();

    console.log(response);
}