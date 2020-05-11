let configDialogState:any = {}

function openConfigDialog(application){
    configDialogState = {...configDialogState, application}

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



    // create "add serving file section"
    const addServingFileDiv = document.createElement('div');
    addServingFileDiv.classList.add('config-serving-file');

    const directoryToServe = document.createElement('input');
    directoryToServe.id = 'directoryToServe';
    directoryToServe.placeholder = 'Directory to serve e.g. build, dist. Leave blank if root directory';

    const portInput = document.createElement('input');
    portInput.id = 'portInput';
    portInput.placeholder = 'Port number to host application on';

    const rerouteDefaultPathTo = document.createElement('input');
    rerouteDefaultPathTo.id = 'rerouteDefaultPathTo';
    rerouteDefaultPathTo.placeholder = 'Reroute default path to this file (optional)';

    const addFileButton = document.createElement('button');
    addFileButton.innerText = 'Add Serving File';
    addFileButton.addEventListener('click', addServingFile);

    addServingFileDiv.appendChild(directoryToServe);
    addServingFileDiv.appendChild(portInput);
    addServingFileDiv.appendChild(rerouteDefaultPathTo);
    addServingFileDiv.appendChild(addFileButton);

    dialogBody.appendChild(addServingFileDiv);



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
    // reset configDialogState
    configDialogState = {};
    // remove dialog from dialog
    document.querySelector('body').removeChild(document.querySelector('.config-dialog-backdrop'));
}

async function runCommands(){
    const request = await fetch(
        '/api/application/setup',
        {
            method:'POST',
            body:JSON.stringify({
                commands:'',
                application:''
            }),
            headers:{
                'Content-Type':'application/json'
            }
        }
    );

    const response = await request.json();

    // 
}

async function addServingFile(){
    const portInputText = document.querySelector('#portInput')['value']; 
    const directoryToServeText = document.querySelector('#directoryToServe')['value']; 
    const rerouteDefaultPathToText = document.querySelector('#rerouteDefaultPathTo')['value']; 

    const request = await fetch(
        '/api/application/serve-file',
        {
            method:'POST',
            body:JSON.stringify({
                applicationId:configDialogState.application.id,
                serveFrom:directoryToServeText ? directoryToServeText : '.',
                rerouteDefaultPathTo:rerouteDefaultPathToText,
                port:portInputText
            }),
            headers:{
                'Content-Type':'application/json'
            }
        }
    );

    const response = await request.json();

    console.log(response);
}