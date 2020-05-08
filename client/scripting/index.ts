window.addEventListener('load', async (e) => {
    let applications: any = await fetch('/api/applications');
    applications = (await applications.json()).table;

    renderApplicationCards(applications);

    document.querySelector('#openCloningDialog').addEventListener('click', openCloningDialog);
    document.querySelectorAll('#closeCloningDialog').forEach(el => el.addEventListener('click', closeCloningDialog));
    document.querySelector('#cloneRepository').addEventListener('click', cloneRepository);

    document.querySelector('#refreshApplications').addEventListener('click', refreshApplications);
});