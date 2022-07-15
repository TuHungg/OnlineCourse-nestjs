export default class UserHelper {
    static genFullName(firstName = '', lastName = '') {
        return `${firstName} ${lastName}`.trim();
    }
}
