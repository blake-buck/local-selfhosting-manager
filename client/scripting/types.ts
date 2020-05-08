interface Application{
    id:string;
    title:string;
    favicon:string | undefined;
}

// for whatever reason default Elements dont have the value property; this custom interface fixes that
interface InputElement extends Element{
    value:string;
}