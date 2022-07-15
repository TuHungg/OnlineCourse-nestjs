import * as crypto from 'crypto';
import dot from 'dot-object';
import * as lodash from 'lodash';
import md5 from 'md5';
import mongoose from 'mongoose';
import * as pluralize from 'pluralize';
import * as util from 'util';

export default class Helper {
    // LIBS
    static get lodash() {
        return lodash;
    }
    //
    static isObjectId(val: string): boolean {
        try {
            const objId = new mongoose.Types.ObjectId(val);
            return objId.toString() == val;
        } catch (e) {
            return false;
        }
    }
    static cvtObjectId(id: string): mongoose.Types.ObjectId {
        return new mongoose.Types.ObjectId(id);
    }
    static md5(string: string): string {
        return md5(string);
    }
    static genRandomNumber(length: number): string {
        const result = Math.floor(Math.random() * Math.pow(10, length));
        return lodash.pad(result + '', length, '0');
    }
    static genRandomHash(): string {
        return crypto.randomBytes(64).toString('hex');
    }
    static isPlural(string: string) {
        return pluralize.isPlural(string);
    }
    static toPlural(string: string) {
        return pluralize.plural(string);
    }
    static log(...args) {
        console.info(...args);
    }
    static deepLog(obj: object, ...rest) {
        console.info(...rest, util.inspect(obj, { showHidden: false, depth: null, colors: true }));
    }
    static isObjectIds(idArr: string[]): boolean {
        for (const item of idArr) {
            if (!Helper.isObjectId(item)) {
                return false;
            }
        }
        return true;
    }
    static cvtDotObj(obj: object) {
        dot.keepArray = true;
        return dot.dot(obj);
    }
    static decodeUrl(url: string) {
        return decodeURIComponent(url);
    }
    static pickObjValue(obj: object, path: string) {
        return dot.pick(path, obj);
    }

    static encodeBase64(val: string) {
        return Buffer.from(val).toString('base64');
    }
    static decodeBase64(val: string) {
        return Buffer.from(val, 'base64').toString('ascii');
    }
    static genQueryString(data: any) {
        let queryString = '';
        for (const key in data) {
            queryString += `&${key}=${data[key]}`;
        }
        queryString = queryString.slice(1);
        return queryString;
    }
}
