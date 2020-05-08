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