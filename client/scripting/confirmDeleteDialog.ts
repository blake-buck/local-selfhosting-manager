function openConfirmationDialog(application:Application){
    const backdrop = document.createElement('div');
    backdrop.classList.add('dialog-backdrop');
    backdrop.classList.add('confirm-delete-dialog-backdrop');

    const body = document.createElement('div');
    body.classList.add('center-column-layout');
    body.classList.add('dialog-body')

    backdrop.appendChild(body);

    body.innerHTML = `
        <h1>Delete ${application.id}?</h1>
        <p>This action can't be undone.</p>
        <span>
            <button id='closeConfirmationDialog'>close</button>
            <button id='deleteApplication' >delete</button>
        </span>
    `

    body.querySelector('#closeConfirmationDialog').addEventListener('click', closeConfirmationDialog);
    body.querySelector('#deleteApplication').addEventListener('click', () => {
        deleteApplication(application.id);
        closeConfirmationDialog();
    })

    document.body.append(backdrop);
}

function closeConfirmationDialog(){
    document.querySelector('.dialog-backdrop').remove();
}