import { TController } from '../types/shared.type';

export default interface IConflictData {
    reference: { type: TController; amount: number };
}
