interface Application{
    id:string;
    title:string;
    favicon:string | undefined;
    startScript:string | undefined;
    status:string | undefined;
    shortcutPort:number | undefined;
}

// for whatever reason default Elements dont have the value property; this custom interface fixes that
interface InputElement extends Element{
    value?:string;
    files?:FileList
    blur?:any;
}

interface Snackbar{
    id:number;
    message:string;
    color: snackbarColor;
    timeout?:number;
}

type snackbarColor = string;