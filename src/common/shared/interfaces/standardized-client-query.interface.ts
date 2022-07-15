import { FilterQuery } from 'mongoose';
export default interface IStandardizedClientQuery<T> {
    skip?: number;
    limit: number;
    filter: FilterQuery<T>;
    sort: any;
    search?: any;
}
