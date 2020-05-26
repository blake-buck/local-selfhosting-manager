let snackbarList:Snackbar[] = [];

export function renderSnackbars(snackbars:Snackbar[]){
    const snackbarDiv = document.querySelector('.snackbars');

    snackbarDiv.innerHTML = '';

    snackbars.forEach(snackbar => 
        snackbarDiv.append(
            createSnackbarElement(snackbar)
        )
    );
}

export function openSnackbar(message:string, color:snackbarColor, timeout?:number){
    const id = Math.random();

    snackbarList.push({id, message, color, timeout});

    renderSnackbars(snackbarList);

    return id;
}

export function createSnackbarElement(snackbar:Snackbar){
    const {id, message, color} = snackbar;

    const wrapper = document.createElement('div');
    wrapper.classList.add('snackbar');
    wrapper.classList.add(color);

    const messageSpan = `<span>${message}</span>`;
    wrapper.innerHTML += messageSpan;

    const action = `<button>&#10006</button>`;
    wrapper.innerHTML += action;

    wrapper.querySelector('button').addEventListener('click', () => closeSnackbar(id));

    if(snackbar.timeout){
        setTimeout(() => closeSnackbar(id), snackbar.timeout);
    }

    return wrapper;
}

export function closeSnackbar(id:number){
    snackbarList = snackbarList.filter(snackbar => snackbar.id !== id);
    renderSnackbars(snackbarList);
}