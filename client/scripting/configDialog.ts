let configDialogState:any = {}

function openConfigDialog(application){
    configDialogState = {...configDialogState, application}

    // create dialog header
    const dialogHeader = `
    <header>
        <h2 class='config-dialog-header'>Application Configuration</h2>
        <button>&#10006;</button>
    </header>
    `


    // create an application setup section
    const applicationSetupTemplate = `
        <div class='config-application-setup'>
            <h3>
                Application Setup 
                <b>
                    ?
                    <span>
                        Use this to run commands such as "npm install" or "npm build". Commands are run in the root folder of the application.
                        If commands need to be run in child directories, type the directory name, seperated by forward slashes "/".
                    </span>
                </b>
            </h3>

            <label>Commands to Run</label>
            <input id='commandsInput' placeholder='Commands to Run' />

            <label>Child Directory (optional</label>
            <input id='applicationChildDirectoryInput' placeholder='e.g. subfolder/anotherFolder' />

            <button>Run Commands</button>
        </div>
    `


    // modify application start script
    const configSartScriptTemplate = `
    <div class='config-application-start-script'>
        <h3>
            Application Start Script 
            <b>
                ?
                <span>
                    The command used to start the application e.g. "node index.js" or "py script.py".
                    If you're using the serving file generated by the manager, this value should be "local-selfhosting-serve-file.js".
                </span>
            </b>
        </h3>
        <input id='applicationStartScriptInput' value='${application.startScript ? application.startScript : ''}' placeholder='Application Start Script' />
        <button>modify</button>
    </div>
    `


    // create "add serving file section"

    const addServingFileTemplate = `
    <div class='config-serving-file'>
        <h3>
            Create Serving File 
            <b>
                ?
                <span>
                    Add a file that serves application clients. Useful for projects that don't serve themselves e.g. standalone React applications. 
                </span>
            </b>
        </h3>
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
        <h3>
            Create Shortcut
            <b>
                ?
                <span>Creates a shortcut on your desktop that links to the URL of this application.</span>
            </b>
        </h3>
        <label>Application Port</label>
        <input id='createShortcutInput' value='${application.shortcutPort ? application.shortcutPort : ''}' placeholder='Application Port Number' />
        <button>Create Shortcut</button>
    </div>
    `

    // create a favicon upload 
    const uploadFaviconTemplate = `
    <div class='upload-favcion-div'>
        <h3>
            Upload Favicon
            <b>
                ?
                <span>Change/upload a favicon to this application</span>
            </b>
        </h3>
        <label>Select File</label>
        <input id='uploadFaviconInput' accept='image/x-icon' type='file' />
        <button>Upload</button>
    </div>
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
                ${uploadFaviconTemplate}
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

    document.querySelector('.config-dialog-body .upload-favcion-div button').addEventListener('click', () => {
        const inputValue = document.querySelector('#uploadFaviconInput')['files'][0];
        uploadFavicon(application, inputValue);
    })
    
    document.querySelector('.config-dialog-body header button').addEventListener('click', closeConfigDialog);

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

    let updatedValues:{startScript:string, status?: string} = {
        startScript
    };

    if(configDialogState.application.status === 'UNCONFIGURED'){
        updatedValues.status = 'STOPPED';
    }

    const request = await fetch(
        `/api/application/${configDialogState.application.id}`,
        {
            method:'PUT',
            body:JSON.stringify({
                updatedValues
            }),
            headers:{
                'Content-Type':'application/json'
            }
        }
    );

    const response = await request.json();

    if(response.status === 200){
        renderApplicationCards(response.table);
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

async function uploadFavicon(application, inputValue:Blob){
    const reader = new FileReader();
    reader.readAsBinaryString(inputValue);

    reader.onload = async (e) => {
        const faviconData = e.target.result;
        const applicationId = application.id;

        const request = await fetch(
            '/api/application/favicon',
            {
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({applicationId, faviconData})
            }
        );

        const response = await request.json();

        if(response.status === 200){
            openSnackbar(response.message, 'green', 5000);
            renderApplicationCards(response.table);
        }
        else{
            openSnackbar(response.message, 'red', 5000);
        }

    }
}