let selectedItem = '';

function clearDialog(){
    document.querySelector('.selected-item')?.classList.remove('selected-item');
    document.body.removeChild(document.querySelector('.directory-picker-backdrop'));
    selectedItem = '';
}

function listDirectoryContents(directoryContents, directoryTitle, path, nestingLevel=0, renderFiles){
    let directoryKeys = Object.keys(directoryContents);

    let stringToPrint = '';
    let directories = '';
    let files = '';

    for(let i=0; i < directoryKeys.length; i++){
        const direntName = directoryKeys[i];

        if(typeof directoryContents[direntName] === 'object' && directoryContents[direntName] !== undefined){
            directories += listDirectoryContents(directoryContents[direntName], direntName, `${path}/${direntName}`, nestingLevel+1, renderFiles);
            
        }
        else{
            files += `<li data-path='${path}' style='margin-left:5px' class='file ${renderFiles ? '' : 'hide'}'>${direntName}</li>`;
        }
    }

    stringToPrint = directories + files;

    return `
    <ul class='collapsed-directory' style='margin-left:${nestingLevel * 10}px;'>
        <p data-path='${path}' class='directory'> <b>&#8744;</b> ${directoryTitle}</p>
        ${stringToPrint}
    </ul>
    ` 
}

export async function renderDirectoryPicker(applicationId, renderFiles){
    return new Promise<string>(async (resolve, reject) => {
        const request = await fetch(`/api/application/${applicationId}/directory`);
        const response = await request.json();
    
        let directoryContents = response.contents;
        
        const div = document.createElement('div');
    
        div.classList.add('directory-picker-backdrop')
    
        div.innerHTML = `
            <div class='dialog-body directory-picker'>
                ${listDirectoryContents(directoryContents, applicationId, applicationId, 0, renderFiles)}
                <footer>
                    <button id='cancel'>Cancel</button>
                    <button id='selectItem'>Select</button>
                </footer>
            </div>
        `;
        ;
        
        div.querySelectorAll('.file').forEach(node => node.addEventListener('click', e => {
                document.querySelector('.selected-item')?.classList.remove('selected-item');
                node.classList.add('selected-item');
                selectedItem = `${node.getAttribute('data-path')}/${node['innerText']}`;
            }
        ));
        
        div.querySelectorAll('.directory').forEach(node => {
            document.querySelector('.selected-item')
            node.addEventListener('click', () => {
                document.querySelector('.selected-item')?.classList.remove('selected-item');
                node.classList.add('selected-item');
                selectedItem = node.getAttribute('data-path');
            })
        });
    
        div.querySelectorAll('.directory b').forEach(node => node.addEventListener('click', () => {
            document.querySelector('.selected-item')?.classList.remove('selected-item');
            node.parentElement.parentElement.classList.toggle('expanded-directory');
            node.parentElement.parentElement.classList.toggle('collapsed-directory');
        }));
    
        div.querySelector('button#cancel').addEventListener('click', () => cancel(reject));
        div.querySelector('button#selectItem').addEventListener('click', () => returnSelectedItem(resolve));
    
        document.body.appendChild(div);
    });
   
}

function returnSelectedItem(resolve){
    resolve(selectedItem);
    clearDialog();
}

function cancel(reject){
    reject();
    clearDialog();
}