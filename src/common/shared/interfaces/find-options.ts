export default interface IFindOptions {
    lookupMode?: 'detail' | 'basic';
    project?: { [key: string]: number };
}
