import { openSnackbar } from "./snackbars";

export const CONSTANTS = {
    SNACKBAR_COLORS:{
        GREEN:'green',
        GRAY:'gray',
        RED:'red'
    },
    CLICK:'click',
    RUNNING : 'RUNNING',
    STOPPED : 'STOPPED',
    UNCONFIGURED : 'UNCONFIGURED'
}

const {GREEN, RED} = CONSTANTS.SNACKBAR_COLORS;
export function handleResponse(response, ...funcs){
    if(response.status === 200){
        openSnackbar(response.message, GREEN, 5000);
        funcs.forEach(func => func());
    }
    else{
        openSnackbar(response.message, RED, 5000);
    }
}


export const headers = {
    'Content-Type':'application/json'
}