const dialogBackdrop = () => document.querySelector('.clone-app-dialog-backdrop');
const step1 = () => document.querySelector('.clone-app-dialog-backdrop .step-1');
const step2 = () => document.querySelector('.clone-app-dialog-backdrop .step-2');
const step3 = () => document.querySelector('.clone-app-dialog-backdrop .step-3');

function openCloningDialog(){
    initializeCloningDialog();

    // display the dialog on step 1 
    reRenderCloningDialog(`
    <div class='step-1'>
        <h3>Clone Git Repository</h3>
        <input id='repoUrl' placeholder='Repo URL' />
        <span>
            <button id='closeCloningDialog'>Close</button>
            <button id='cloneRepository'>Clone</button>
        </span>
        
    </div>
    `);
    document.querySelector('.step-1 #closeCloningDialog').addEventListener('click', closeCloningDialog);
    document.querySelector('#cloneRepository').addEventListener('click', cloneRepository);

}

async function closeCloningDialog(){
    // May need to removeEvent listeners when dialog is closed
    document.querySelector('body').removeChild(document.querySelector('.clone-app-dialog-backdrop'));
}

async function cloneRepository(){
    // pull the user entered text from dialog input
    const repoInput:InputElement = document.querySelector('#repoUrl');
    const repoUrl = repoInput.value;

    // if the user has entered something into the field, continue
    if(repoUrl){
        // move from step 1 (enter repo URL) to step 2 (loading screen)

        reRenderCloningDialog(`
        <div class='step-2'>
            <h3>Cloning</h3>
            <div class='spinner'></div>
            <span>
                <button id='closeCloningDialog'>Close</button>
            </span>
        </div>
        `);

        document.querySelector('.step-2 #closeCloningDialog').addEventListener('click', closeCloningDialog);

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
    
        // once a response is received, move from step 2 to step 3
        reRenderCloningDialog(`
        <div class='step-3'>
            <h3>Success</h3>
            <p>&#10004;</p>
            <span>
                <button id='closeCloningDialog'>Close</button>
            </span>
        </div>
        `);

        document.querySelector('.step-3 #closeCloningDialog').addEventListener('click', closeCloningDialog);

    
        // get an updated list of applications and rerender cards
        let applications: any = await fetch('/api/applications');
        applications = (await applications.json()).table;
    
        renderApplicationCards(applications);
    }

}

function dialogWrapper(contents:string){
    return `
    <div class='clone-app-dialog-backdrop'>
        <div class='clone-app-dialog dialog-body'>
            ${contents}
        </div>
    </div>
    `
}

function initializeCloningDialog(){
    document.body.insertAdjacentHTML('beforeend', dialogWrapper(''));
}

function reRenderCloningDialog(contents){
    const dialog = document.querySelector('.clone-app-dialog-backdrop')

    dialog.innerHTML = dialogWrapper(contents);
}