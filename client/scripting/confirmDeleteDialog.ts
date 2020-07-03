import { deleteApplication } from "./applications";

import {CONSTANTS} from './service';
const {CLICK} = CONSTANTS;

// CSS class/id constants
const CLOSE_CONFIRMATION_DIALOG = 'closeConfirmationDialog';
const CLOSE_CONFIRMATION_DIALOG_ID = `#${CLOSE_CONFIRMATION_DIALOG}`;

const DELETE_APPLICATION = 'deleteApplication';
const DELETE_APPLICATION_ID = `#${DELETE_APPLICATION}`;

const DIALOG_BACKDROP = 'dialog-backdrop';
const DIALOG_BACKDROP_CLASS = `.${DIALOG_BACKDROP}`;


export function openConfirmationDialog(application:Application){
    const backdrop = document.createElement('div');
    backdrop.classList.add(DIALOG_BACKDROP);
    backdrop.classList.add('confirm-delete-dialog-backdrop');

    const body = document.createElement('div');
    body.classList.add('center-column-layout');
    body.classList.add('dialog-body')

    backdrop.appendChild(body);

    body.innerHTML = `
        <h1>Delete ${application.id}?</h1>
        <p>This action can't be undone.</p>
        <span>
            <button id='${CLOSE_CONFIRMATION_DIALOG}'>close</button>
            <button id='${DELETE_APPLICATION}' >delete</button>
        </span>
    `

    body.querySelector(CLOSE_CONFIRMATION_DIALOG_ID).addEventListener(CLICK, closeConfirmationDialog);
    body.querySelector(DELETE_APPLICATION_ID).addEventListener(CLICK, () => {
        deleteApplication(application.id);
        closeConfirmationDialog();
    });

    document.body.append(backdrop);
}

function closeConfirmationDialog(){
    document.querySelector(DIALOG_BACKDROP_CLASS).remove();
}