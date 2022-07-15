import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';

export default class ControllerHelper {
    static handleUpdateResult(
        result: { matchedCount: number; modifiedCount: number },
        throwException = true
    ) {
        if (!!result) {
            if (result.matchedCount > 0 && result.modifiedCount > 0) return true;
        }
        if (throwException) throw new BadRequestException();
        return false;
    }

    static getClientIp(req: Request): string {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
        return ip as string;
    }
}
