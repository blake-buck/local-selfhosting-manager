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

    // add the application title and action buttons to the card
    card.innerHTML += 
    `
    <header>
        <span>${application.title}</span>
    </header>

    <footer>
        <button id='startApplication'>Start Application</button>
        <button id='stopApplication'>Stop Application</button>
        <button id='configureApplication'>Configure Application</button>
        <button>Create Shortcut</button>
        <button id='deleteApplication'>Delete Application</button>
    </footer>
    `;

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
    let response: any = await fetch(
        `/api/application/${id}`, 
        { method:'DELETE' }
    );

    const applications = (await response.json()).table;

    renderApplicationCards(applications);
}

async function startApplication(application:Application, scriptArgs?:string){
    const request = await fetch(
        '/api/application/start',
        {
            method:'POST',
            body:JSON.stringify({
                applicationPath:application.id,
                applicationName:application.title,
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
}