const dialogBackdrop = () => document.querySelector('.clone-app-dialog-backdrop');
const step1 = () => document.querySelector('.clone-app-dialog-backdrop .step-1');
const step2 = () => document.querySelector('.clone-app-dialog-backdrop .step-2');
const step3 = () => document.querySelector('.clone-app-dialog-backdrop .step-3');

function openCloningDialog(){
    // reset dialog to a blank slate
    closeCloningDialog();

    // display the dialog on step 1 
    dialogBackdrop().classList.add('displayFlex');
    step1().classList.add('displayFlex');
}

async function closeCloningDialog(){
    dialogBackdrop().classList.remove('displayFlex');
    step1().classList.remove('displayFlex');
    step2().classList.remove('displayFlex');
    step3().classList.remove('displayFlex');
}

async function cloneRepository(){
    // pull the user entered text from dialog input
    const repoInput:InputElement = document.querySelector('#repoUrl');
    const repoUrl = repoInput.value;

    // if the user has entered something into the field, continue
    if(repoUrl){
        // move from step 1 (enter repo URL) to step 2 (loading screen)
        step1().classList.remove('displayFlex');
        step2().classList.add('displayFlex');
    
    
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
        step2().classList.remove('displayFlex');
        step3().classList.add('displayFlex');
    
        // get an updated list of applications and rerender cards
        let applications: any = await fetch('/api/applications');
        applications = (await applications.json()).table;
    
        renderApplicationCards(applications);
    }

}