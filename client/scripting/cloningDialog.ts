function openCloningDialog(){
    initializeCloningDialog();

    // display the dialog on step 1 
    renderStepOne();
    
    document.querySelector('.step-1 #closeCloningDialog').addEventListener('click', closeCloningDialog);

    document.querySelector('#cloneRepository').addEventListener('click', () => {
        // pull the user entered text from dialog input
        const repoInput:InputElement = document.querySelector('#repoUrl');
        const repoUrl = repoInput.value;
        cloneRepository(repoUrl);
    });

}

async function closeCloningDialog(){
    // May need to removeEvent listeners when dialog is closed
    document.querySelector('body').removeChild(document.querySelector('.clone-app-dialog-backdrop'));
}

async function cloneRepository(repoUrl:string){
    // if the user has entered something into the field, continue
    if(repoUrl){
        // move from step 1 (enter repo URL) to step 2 (loading screen)
        renderStepTwo();

        document.querySelector('.step-2 #closeCloningDialog').addEventListener('click', closeCloningDialog);

        const body = {repoUrl};

        let request: any = await fetch(
            '/api/application/clone', 
            {
                method:'POST',
                body:JSON.stringify(body),
                headers
            }
        );
    
        let response = await request.json();
    
        // once a response is received, move from step 2 to step 3
        if(response.status === 200){
            renderStepThree(false);
        
            // get an updated list of applications and rerender cards
            let applications: any = await fetch('/api/applications');
            applications = (await applications.json()).table;
        
            renderApplicationCards(applications);
        }
        else{
            renderStepThree(true);
        }

        document.querySelector('.step-3 #closeCloningDialog').addEventListener('click', closeCloningDialog);
        
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
    const dialog = document.querySelector('.clone-app-dialog-backdrop');
    
    if(dialog){
        dialog.innerHTML = dialogWrapper(contents);
    }
}

function renderStepOne(){
    reRenderCloningDialog(`
    <div class='center-column-layout step-1'>
        <h3>Clone Git Repository</h3>
        <input id='repoUrl' placeholder='Repo URL' />
        <span>
            <button id='closeCloningDialog'>Close</button>
            <button id='cloneRepository'>Clone</button>
        </span>
        
    </div>
    `);
}

function renderStepTwo(){
    reRenderCloningDialog(`
    <div class='center-column-layout step-2'>
        <h3>Cloning</h3>
        <div class='spinner'></div>
        <span>
            <button id='closeCloningDialog'>Close</button>
        </span>
    </div>
    `);
}

function renderStepThree(failure:boolean){
    let template = `
    <div class='center-column-layout step-3'>
        <h3>Success</h3>
        <p>&#10004;</p>
        <span>
            <button id='closeCloningDialog'>Close</button>
        </span>
    </div>
    `;

    if(failure){
        template = `
        <div class='center-column-layout step-3'>
            <h3>Failure</h3>
            <p>&#10006;</p>
            <span>
                <button id='closeCloningDialog'>Close</button>
            </span>
        </div>
        `
    }
    reRenderCloningDialog(template);
}