function openConfigDialog(){
    // create dialog backdrop
    const backdrop = document.createElement('div');
    backdrop.classList.add('config-dialog-backdrop');

    

    // create dialog body
    const dialogBody = document.createElement('div');
    dialogBody.classList.add('config-dialog-body');

    backdrop.appendChild(dialogBody);



    // create dialog header
    const dialogHeader = document.createElement('h3');
    dialogHeader.classList.add('config-dialog-header');
    dialogHeader.innerText = 'Application Configuration';

    dialogBody.appendChild(dialogHeader);



    // create an application setup section
    const applicationSetup = document.createElement('div');
    applicationSetup.classList.add('config-application-setup');

    const commandsInput = document.createElement('input');
    const runCommands = document.createElement('button');
    runCommands.innerText = 'Run Commands';

    applicationSetup.appendChild(commandsInput);
    applicationSetup.appendChild(runCommands);

    dialogBody.appendChild(applicationSetup);



    // create a footer with a close button
    const footer = document.createElement('footer');
    footer.classList.add('config-footer')

    const closeDialog = document.createElement('button');
    closeDialog.innerText = 'Close';
    closeDialog.addEventListener('click', closeConfigDialog);

    footer.appendChild(closeDialog);

    dialogBody.appendChild(footer);


    
    // append everything to DOM
    document.querySelector('body').appendChild(backdrop);

}

function closeConfigDialog(){
    // remove dialog from dialog
    document.querySelector('body').removeChild(document.querySelector('.config-dialog-backdrop'));
}

async function setup(){
    await fetch('/api/application/setup')
}