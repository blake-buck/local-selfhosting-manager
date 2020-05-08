const dialogBackdrop = () => document.querySelector('.clone-app-dialog-backdrop');
const step1 = () => document.querySelector('.clone-app-dialog-backdrop .step-1');
const step2 = () => document.querySelector('.clone-app-dialog-backdrop .step-2');
const step3 = () => document.querySelector('.clone-app-dialog-backdrop .step-3');

function openCloningDialog(){
    dialogBackdrop().classList.remove('displayFlex');
    step1().classList.remove('displayFlex');
    step2().classList.remove('displayFlex');
    step3().classList.remove('displayFlex');

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
    const repoInput:InputElement = document.querySelector('#repoUrl');
    const repoUrl = repoInput.value;

    if(repoUrl){
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
    
        step2().classList.remove('displayFlex');
        step3().classList.add('displayFlex');
    
        let applications: any = await fetch('/api/applications');
        applications = (await applications.json()).table;
    
        renderApplicationCards(applications);
    }

}