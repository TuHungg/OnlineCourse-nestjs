export default class DateHelper {
    static getBoundaryDateOfMonth(date: Date) {
        const first = new Date(date.getFullYear(), date.getMonth(), 1);
        const last = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
        return { first, last };
    }
    static isBetweenTwoDateString(dateStr1: string, dateStr2: string) {
        const start = new Date(dateStr1).getTime();
        const end = new Date(dateStr2).getTime();
        const current = new Date().getTime();
        return current >= start && current <= end;
    }
}
