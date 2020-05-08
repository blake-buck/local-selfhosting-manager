interface Application{
    id:string;
    title:string;
    favicon:string | undefined;
}

interface InputElement extends Element{
    value:string;
}