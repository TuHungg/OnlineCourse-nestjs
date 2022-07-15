import { sha256 } from 'js-sha256';
export default class HashHelper {
    static genSha256Hash(message: string, key: string) {
        return sha256.hmac(key, message);
    }
}