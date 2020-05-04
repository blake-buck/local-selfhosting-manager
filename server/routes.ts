import {refresh, cloneRepo, addApplication, getApplicationById, getAllApplications, applicationSetup, deleteApplication} from './controllers';

export function useApplicationRoutes(app){

    app.get(
        '/api/applications',
        getAllApplications
    );

    app.get(
        '/api/application/:id',
        getApplicationById
    );

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
    )

    app.post(
        '/api/application/setup',
        applicationSetup
    )

    app.delete(
        '/api/application/:id',
        deleteApplication
    )
}




