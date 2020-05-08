const applicationDiv = () => document.querySelector('.application-cards');

function createCard(application:Application){
    const card = document.createElement('div');
    card.classList.add('card');
    card.id = application.id;

    card.innerHTML = '';

    if(application.favicon){
        card.innerHTML += 
        `
        <div class='card-media'> 
            <img src='${application.favicon.replace(/\\/g, '/')}' alt='card media' />
        </div>
        `
    }

    card.innerHTML += 
    `
    <header>
        <span>${application.title}</span>
    </header>

    <footer>
        <button>Start Application</button>
        <button>Stop Application</button>
        <button>Configure Application</button>
        <button>Create Shortcut</button>
        <button id='deleteApplication'>Delete Application</button>
    </footer>
    `

    card.querySelector('#deleteApplication').addEventListener('click', () => deleteApplication(application.id));

    return card
}


function renderApplicationCards(applications:Application[]){
    applicationDiv().innerHTML = '';

    applications.forEach(
        application => {
            applicationDiv().appendChild(
                createCard(application)
            );
        }
    );
}

async function refreshApplications(){
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