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
    const applicationSetupDiv = document.createElement('div');
    applicationSetupDiv.classList.add('config-application-setup');

    const applicationChildDirectoryInput = document.createElement('input');
    applicationChildDirectoryInput.id = 'applicationChildDirectoryInput';
    applicationChildDirectoryInput.placeholder = 'Child Directory';

    const commandsInput = document.createElement('input');
    commandsInput.id = 'commandsInput';
    commandsInput.placeholder = 'Commands to Run';

    const runCommands = document.createElement('button');
    runCommands.innerText = 'Run Commands';
    runCommands.addEventListener('click', () => applicationSetup(application.id))

    applicationSetupDiv.appendChild(applicationChildDirectoryInput);
    applicationSetupDiv.appendChild(commandsInput);
    applicationSetupDiv.appendChild(runCommands);

    dialogBody.appendChild(applicationSetupDiv);


    // modify application start script
    const applicationStartScriptDiv = document.createElement('div');
    applicationStartScriptDiv.classList.add('config-application-start-script');


    const applicationStartScriptInput = document.createElement('input');
    applicationStartScriptInput.id = 'applicationStartScriptInput';
    applicationStartScriptInput.placeholder = 'Application Start Script';

    applicationStartScriptDiv.appendChild(applicationStartScriptInput);


    const applicationStartScriptButton = document.createElement('button');
    applicationStartScriptButton.innerText = 'modify';
    applicationStartScriptButton.addEventListener('click', () => modifyStartScript());

    applicationStartScriptDiv.appendChild(applicationStartScriptButton);

    dialogBody.appendChild(applicationStartScriptDiv);



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


    // create shortcut button
    const createShortcutDiv = document.createElement('div');
    createShortcutDiv.classList.add('create-shortcut-div');

    const createShortcutInput = document.createElement('input');
    createShortcutInput.placeholder = 'Application Port Number';
    createShortcutInput.id = 'createShortcutInput';

    const createShortcutButton = document.createElement('button');
    createShortcutButton.innerText = 'Create Shortcut';
    createShortcutButton.style.marginLeft = 'auto';

    createShortcutButton.addEventListener('click', () => createApplicationShortcut(application));

    createShortcutDiv.append(createShortcutInput);
    createShortcutDiv.append(createShortcutButton);

    dialogBody.append(createShortcutDiv)

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

async function applicationSetup(application:string){
    const commands = document.querySelector('#commandsInput')['value'];
    const childDirectory = document.querySelector('#applicationChildDirectoryInput')['value'];

    console.log('APPLICATION SETUP ', commands, childDirectory)

    const request = await fetch(
        '/api/application/setup',
        {
            method:'POST',
            body:JSON.stringify({
                commands,
                application: childDirectory ? `${application}/${childDirectory}`: application
            }),
            headers:{
                'Content-Type':'application/json'
            }
        }
    );

    const response = await request.json();

    console.log(response);
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

async function modifyStartScript(){
    const startScriptText = document.querySelector('#applicationStartScriptInput')['value'];

    const request = await fetch(
        `/api/application/${configDialogState.application.id}`,
        {
            method:'PUT',
            body:JSON.stringify({
                updatedValues:{
                    startScript:startScriptText
                }
            }),
            headers:{
                'Content-Type':'application/json'
            }
        }
    );
}

async function createApplicationShortcut(application){
    const portNumber = document.querySelector('#createShortcutInput')['value'];

    const request = await fetch(
        '/api/application/create-shortcut',
        {
            method:'POST',
            body:JSON.stringify({
                shortcutName:application.id, 
                shortcutUrl:`http://localhost:${portNumber}`, 
                applicationId:application.id
            }),
            headers:{
                'Content-Type':'application/json'
            }
        }
    );

    const response = await request.json();

    console.log(response);
}