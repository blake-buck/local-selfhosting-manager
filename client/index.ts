interface Application{
    id:string;
    title:string;
    favicon:string | undefined;
}

window.addEventListener('load', async (e) => {
    console.log('LOADING')
    let applications: any = await fetch('/api/applications');
    applications = (await applications.json()).table;

    renderApplications(applications);
});


function applicationDiv(){
    return document.querySelector('.application-cards');
}

function createCard(application:Application){
    console.log(application)
    const card = document.createElement('div');
    card.classList.add('card');

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
        <button>Delete Application</button>
    </footer>
    `
    return card
}

function renderApplications(applications:Application[]){
    applications.forEach(
        application => {
            applicationDiv().appendChild(
                createCard(application)
            );
        }
    );
}