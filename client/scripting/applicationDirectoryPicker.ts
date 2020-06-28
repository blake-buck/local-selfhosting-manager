import { handleResponse, CONSTANTS} from "./service";
const {CLICK} = CONSTANTS;

// HTML constants
const DATA_PATH = 'data-path';

// CSS class/id constants
const SELECTED_ITEM = 'selected-item';
const SELECTED_ITEM_CLASS = `.${SELECTED_ITEM}`;

const DIRECTORY_PICKER_BACKDROP = 'directory-picker-backdrop';
const DIRECTORY_PICKER_BACKDROP_CLASS = `.${DIRECTORY_PICKER_BACKDROP}`;

const DIRECTORY = 'directory';
const DIRECTORY_CLASS = `.${DIRECTORY}`;

const FILE = 'file';
const FILE_CLASS = `.${FILE}`;

const COLLAPSED_DIRECTORY = 'collapsed-directory';
const EXPANDED_DIRECTORY = 'expanded-directory';

const CANCEL = 'cancel';
const SELECT_ITEM = 'selectItem';

// Directory picker "state"
let selectedItem = '';


// Functions
function closeDialog(){
    document.querySelector(SELECTED_ITEM_CLASS)?.classList.remove(SELECTED_ITEM);
    document.body.removeChild(document.querySelector(DIRECTORY_PICKER_BACKDROP_CLASS));
    selectedItem = '';
}

function listDirectoryContents(directoryContents, directoryTitle, path, nestingLevel, renderFiles){
    let directoryKeys = Object.keys(directoryContents);

    let combinedHTML = '';
    let directoryHTML = '';
    let fileHTML = '';

    for(let i=0; i < directoryKeys.length; i++){
        const direntName = directoryKeys[i];
        const childDirectory = directoryContents[direntName];
        const isChildDirectory = typeof childDirectory === 'object';

        if(isChildDirectory){
            directoryHTML += listDirectoryContents(
                childDirectory, 
                direntName, 
                `${path}/${direntName}`, 
                nestingLevel+1, 
                renderFiles
            );
            
        }
        else{
            fileHTML += `<li ${DATA_PATH}='${path}' style='margin-left:5px' class='${FILE} ${renderFiles ? '' : 'hide'}'>${direntName}</li>`;
        }
    }

    combinedHTML = directoryHTML + fileHTML;

    return `
    <ul class='${COLLAPSED_DIRECTORY}' style='margin-left: ${nestingLevel * 10}px;'>
        <p ${DATA_PATH}='${path}' class='directory'> <b>&#8744;</b> ${directoryTitle}</p>
        ${combinedHTML}
    </ul>
    ` 
}

export async function renderDirectoryPicker(applicationId, renderFiles){
    return new Promise<string>(async (resolve, reject) => {
        const request = await fetch(`/api/application/${applicationId}/directory`);
        const response = await request.json();
    
        let directoryContents = response.contents;
        
        const directoryPickerElement = document.createElement('div');
    
        directoryPickerElement.classList.add(DIRECTORY_PICKER_BACKDROP)
    
        directoryPickerElement.innerHTML = `
            <div class='dialog-body directory-picker'>
                ${listDirectoryContents(directoryContents, applicationId, applicationId, 0, renderFiles)}
                <footer>
                    <button id='${CANCEL}'>Cancel</button>
                    <button id='${SELECT_ITEM}'>Select</button>
                </footer>
            </div>
        `;
        ;
        
        directoryPickerElement.querySelectorAll(FILE_CLASS).forEach(node => selectItemClickListener(node, true));
        
        directoryPickerElement.querySelectorAll(DIRECTORY_CLASS).forEach(node => selectItemClickListener(node, false));
    
        directoryPickerElement.querySelectorAll(`${DIRECTORY_CLASS} b`).forEach(node => toggleDirectoryOpenClickListener(node));
    
        directoryPickerElement.querySelector(`#${CANCEL}`).addEventListener(CLICK, () => cancel(reject));
        directoryPickerElement.querySelector(`#${SELECT_ITEM}`).addEventListener(CLICK, () => returnSelectedItem(resolve));
    
        document.body.appendChild(directoryPickerElement);
    });
   
}

function returnSelectedItem(resolve){
    resolve(selectedItem);
    closeDialog();
}

function cancel(reject){
    reject();
    closeDialog();
}

function toggleDirectoryOpenClickListener(node){
    node.addEventListener(CLICK, () => toggleDirectoryOpen(node));
}

function toggleDirectoryOpen(node){
    node.parentElement.parentElement.classList.toggle(EXPANDED_DIRECTORY);
    node.parentElement.parentElement.classList.toggle(COLLAPSED_DIRECTORY);
}

function selectItemClickListener(node, isFile:boolean){
    node.addEventListener(CLICK, () => selectItem(node, false))
}

function selectItem(node, isFile:boolean){
    document.querySelector(SELECTED_ITEM_CLASS)?.classList.remove(SELECTED_ITEM);
    node.classList.add(SELECTED_ITEM);
    selectedItem = node.getAttribute(DATA_PATH);
    if(isFile){
        selectedItem += ('/' + node['innerText']);
    }
}