import {refresh, cloneRepo, addApplication, getApplicationById, getAllApplications, applicationSetup, deleteApplication, startApplication, stopApplication, addServingFile, createShortcut, addToStartup, removeFromStartup, updateApplication, uploadFavicon, getItemFromDatabase, getApplicationDirectoryFiles} from './controllers';

export function useApplicationRoutes(app){


    // Application GET routes
    app.get(
        '/api/applications',
        getAllApplications
    );

    app.get(
        '/api/application/:id',
        getApplicationById
    );

    app.get(
        '/api/application/:id/directory',
        getApplicationDirectoryFiles
    );

    app.get(
        '/api/getItem/:key',
        getItemFromDatabase
    );



    
    // Application POST routes
    app.post(
        '/api/application', 
        addApplication
    );

    app.post(
        '/api/application/clone',
        cloneRepo
    );

    app.post(
        '/api/applications/refresh',
        refresh
    );

    app.post(
        '/api/application/setup',
        applicationSetup
    );

    app.post(
        '/api/application/start',
        startApplication
    );

    app.post(
        '/api/application/stop',
        stopApplication
    );

    app.post(
        '/api/application/serve-file',
        addServingFile
    );

    app.post(
        '/api/startup/add',
        addToStartup
    );

    app.post(
        '/api/startup/remove',
        removeFromStartup
    );

    app.post(
        '/api/application/create-shortcut',
        createShortcut
    );

    app.post(
        '/api/application/favicon',
        uploadFavicon
    );




    // Application PUT routes
    app.put(
        '/api/application/:id',
        updateApplication
    );




    // Application DELETE routes
    app.delete(
        '/api/application/:id',
        deleteApplication
    );
}




