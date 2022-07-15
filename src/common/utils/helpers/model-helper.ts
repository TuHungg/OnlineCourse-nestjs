import { TModel } from "src/common/shared/types/shared.type";
import Helper from "./helper.helper";

export type TRelatedFieldsToDoc = {
    model: TModel,
    fields: {
        path: string,
        isArray: boolean
    }[]
}
export default class ModelHelper {
    static async deleteRelatedFieldsToDoc(doc: any, data: TRelatedFieldsToDoc[]) {
        const promises: Promise<void>[] = [];
        data.forEach(async item => {
            const model = (doc as any).model(item.model);
            item.fields.forEach(field => {
                if (!field.isArray) {
                    const promise = model.updateMany({ [field.path]: doc._id }, {
                        $unset: {
                            [field.path]: ''
                        }
                    })
                    promises.push(promise);
                } else {
                    const promise = model.updateMany({ [field.path]: doc._id }, {
                        $pull: {
                            [field.path]: doc._id
                        }
                    })
                    promises.push(promise);
                }
            })
        })
        return Promise.all(promises).then(result => Helper.log('related fields deleted', result));
    }
}