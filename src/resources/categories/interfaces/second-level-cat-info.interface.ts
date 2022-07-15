export interface ICatInfo {
    name: string
    slug: string
}

export default interface ISecondLevelCatInfo extends ICatInfo {
    subCats: ICatInfo[]
}