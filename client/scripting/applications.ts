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
        <button>Start Application</button>
        <button>Stop Application</button>
        <button id='configureApplication'>Configure Application</button>
        <button>Create Shortcut</button>
        <button id='deleteApplication'>Delete Application</button>
    </footer>
    `;

    // add event listeners to card buttons
    card.querySelector('#configureApplication').addEventListener('click', () => {
        openConfigDialog()
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