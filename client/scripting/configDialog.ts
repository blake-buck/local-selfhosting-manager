let configDialogState:any = {}

function openConfigDialog(application){
    configDialogState = {...configDialogState, application}

    // create dialog header
    const dialogHeader = `
        <h3 class='config-dialog-header'>Application Configuration</h3>
    `


    // create an application setup section
    const applicationSetupTemplate = `
        <div class='config-application-setup'>
            <label>Child Directory</label>
            <input id='applicationChildDirectoryInput' placeholder='Child Directory' />

            <label>Commands to Run</label>
            <input id='commandsInput' placeholder='Commands to Run' />
            
            <button>Run Commands</button>
        </div>
    `


    // modify application start script
    const configSartScriptTemplate = `
    <div class='config-application-start-script'>
        <label>Application Start Script</label>
        <input id='applicationStartScriptInput' value='${application.startScript ? application.startScript : ''}' placeholder='Application Start Script' />
        <button>modify</button>
    </div>
    `


    // create "add serving file section"

    const addServingFileTemplate = `
    <div class='config-serving-file'>
        <label>Directory to Serve</label>
        <input id='directoryToServe' placeholder='Directory to serve e.g. build, dist. Leave blank if root directory' />

        <label>Port to host on</label>
        <input id='portInput' placeholder='Port to host on' />

        <label>Reroute default path to</label>
        <input id='rerouteDefaultPathTo' placeholder='Reroute default path to this file (optional)' />
        <button>Add Serving File</button>
    </div>
    `


    // create shortcut button
    const createShortcutTemplate = `
    <div class='create-shortcut-div'>
        <label>Application Port</label>
        <input id='createShortcutInput' value='${application.shortcutPort ? application.shortcutPort : ''}' placeholder='Application Port Number' />
        <button>Create Shortcut</button>
    </div>
    `


    // create a footer with a close button
    const footerTemplate = `
    <footer class='config-footer'>
        <button>Close</button>
    </footer>
    `


    // append everything to DOM

    document.querySelector('body')
        .insertAdjacentHTML(
            'beforeend', 
            
            `
            <div class='config-dialog-backdrop'>
                <div class='config-dialog-body dialog-body'>
                ${dialogHeader}
                ${applicationSetupTemplate}
                ${configSartScriptTemplate}
                ${addServingFileTemplate}
                ${createShortcutTemplate}
                ${footerTemplate}
                </div>
            </div>
            `
        );

    document.querySelector('.config-application-setup button').addEventListener('click', () => {
        const commands = document.querySelector('#commandsInput')['value'];
        const childDirectory = document.querySelector('#applicationChildDirectoryInput')['value'];
        applicationSetup(application.id, commands, childDirectory)
    });

    document.querySelector('.config-application-start-script button').addEventListener('click', () => {
        const startScriptText = document.querySelector('#applicationStartScriptInput')['value'];
        modifyStartScript(startScriptText);
    });

    document.querySelector('.config-serving-file button').addEventListener('click', () => {
        const directoryToServeText = document.querySelector('#directoryToServe')['value']; 
        const rerouteDefaultPathToText = document.querySelector('#rerouteDefaultPathTo')['value']; 
        const portInputText = document.querySelector('#portInput')['value']; 
        addServingFile(
            configDialogState.application.id,
            directoryToServeText,
            rerouteDefaultPathToText,
            portInputText
        );
    });

    document.querySelector('.create-shortcut-div button').addEventListener('click', () => {
        const portNumber = document.querySelector('#createShortcutInput')['value'];
        createApplicationShortcut(application, portNumber);
    });
    
    document.querySelector('.config-footer button').addEventListener('click', closeConfigDialog);

}

function closeConfigDialog(){
    // reset configDialogState
    configDialogState = {};
    // remove dialog from dialog
    document.querySelector('body').removeChild(document.querySelector('.config-dialog-backdrop'));
}

async function applicationSetup(application:string, commands:string, childDirectory:string){
    const initialSnackbar = 
        openSnackbar(
            `Running ${commands} in ${ childDirectory ? `${application}/${childDirectory}`: application}`,
            'gray'
        );

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

    closeSnackbar(initialSnackbar);

    console.log(response);

    if(response.status === 200){
        openSnackbar(response.message, 'green', 5000);
    }
    else{
        openSnackbar(response.message, 'red', 5000);
    }
}

async function addServingFile(applicationId:string, serveFrom:string, rerouteDefaultPathTo:string, port:string){
    const request = await fetch(
        '/api/application/serve-file',
        {
            method:'POST',
            body:JSON.stringify({
                applicationId,
                serveFrom: serveFrom ? serveFrom : '.',
                rerouteDefaultPathTo,
                port
            }),
            headers:{
                'Content-Type':'application/json'
            }
        }
    );

    const response = await request.json();

    console.log(response);

    if(response.status === 200){
        openSnackbar(response.message, 'green', 5000);
    }
    else{
        openSnackbar(response.message, 'red', 5000);
    }
}

async function modifyStartScript(startScript:string){
    const request = await fetch(
        `/api/application/${configDialogState.application.id}`,
        {
            method:'PUT',
            body:JSON.stringify({
                updatedValues:{
                    startScript
                }
            }),
            headers:{
                'Content-Type':'application/json'
            }
        }
    );

    const response = await request.json();

    if(response.status === 200){
        openSnackbar(response.message, 'green', 5000);
    }
    else{
        openSnackbar(response.message, 'red', 5000);
    }
}

async function createApplicationShortcut(application, portNumber:string){
    const request = await fetch(
        '/api/application/create-shortcut',
        {
            method:'POST',
            body:JSON.stringify({
                shortcutName:application.id, 
                port:portNumber, 
                applicationId:application.id
            }),
            headers:{
                'Content-Type':'application/json'
            }
        }
    );

    const response = await request.json();

    console.log(response);

    if(response.status === 200){
        openSnackbar(response.message, 'green', 5000);
    }
    else{
        openSnackbar(response.message, 'red', 5000);
    }
}