interface Application{
    id:string;
    title:string;
    favicon:string | undefined;
}

interface InputElement extends Element{
    value:string;
}

window.addEventListener('load', async (e) => {
    let applications: any = await fetch('/api/applications');
    applications = (await applications.json()).table;

    renderApplicationCards(applications);


    document.querySelector('#openCloningDialog').addEventListener('click', openCloningDialog);
    document.querySelectorAll('#closeCloningDialog').forEach(el => el.addEventListener('click', closeCloningDialog));
    document.querySelector('#cloneRepository').addEventListener('click', cloneRepository);

    document.querySelector('#refreshApplications').addEventListener('click', refreshApplications);
});



function applicationDiv(){
    return document.querySelector('.application-cards');
}

function createCard(application:Application){
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

function openCloningDialog(){
    document.querySelector('.clone-app-dialog-backdrop').classList.remove('displayFlex');
    document.querySelector('.clone-app-dialog-backdrop .step-1').classList.remove('displayFlex');
    document.querySelector('.clone-app-dialog-backdrop .step-2').classList.remove('displayFlex');
    document.querySelector('.clone-app-dialog-backdrop .step-2').classList.remove('displayFlex');

    document.querySelector('.clone-app-dialog-backdrop').classList.add('displayFlex');
    document.querySelector('.clone-app-dialog-backdrop .step-1').classList.add('displayFlex');
}

async function closeCloningDialog(){
    document.querySelector('.clone-app-dialog-backdrop').classList.remove('displayFlex');
    document.querySelector('.clone-app-dialog-backdrop .step-1').classList.remove('displayFlex');
    document.querySelector('.clone-app-dialog-backdrop .step-2').classList.remove('displayFlex');
    document.querySelector('.clone-app-dialog-backdrop .step-2').classList.remove('displayFlex');
}



async function cloneRepository(){
    const repoInput:InputElement = document.querySelector('#repoUrl');
    const repoUrl = repoInput.value;

    if(repoUrl){
        document.querySelector('.clone-app-dialog-backdrop .step-1').classList.remove('displayFlex');
        document.querySelector('.clone-app-dialog-backdrop .step-2').classList.add('displayFlex');
    
    
        const body = {repoUrl};

        let response: any = await fetch(
            '/api/application/clone', 
            {
                method:'POST',
                body:JSON.stringify(body),
                headers:{
                    'Content-Type':'application/json'
                }
            }
        );
    
        response = (await response.json());
    
        document.querySelector('.clone-app-dialog-backdrop .step-2').classList.remove('displayFlex');
        document.querySelector('.clone-app-dialog-backdrop .step-3').classList.add('displayFlex');
    
        let applications: any = await fetch('/api/applications');
        applications = (await applications.json()).table;
    
        renderApplicationCards(applications);
    }

}

async function refreshApplications(){
    let response: any = await fetch(
        '/api/applications/refresh', 
        { method:'POST' }
    );

    const applications = (await response.json()).table;
    
    renderApplicationCards(applications);
}