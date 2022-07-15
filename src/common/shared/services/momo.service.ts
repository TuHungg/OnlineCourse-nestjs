/*
https://docs.nestjs.com/providers#services
*/
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import DateHelper from 'src/common/utils/helpers/date.helper';
import HashHelper from 'src/common/utils/helpers/hash.helper';
import Helper from 'src/common/utils/helpers/helper.helper';
import { User } from 'src/resources/users/schemas/user.schema';
import { Promotions } from './../../../resources/courses/dto/create-course.dto';
import { Cart } from './../../../resources/users/schemas/user.schema';
import { USD_FACTOR } from './../../utils/constants/app.constant';

export interface IMomoConfig {
    redirectUrl: string;
    partnerCode: string;
    partnerName: string;
    storeId: string;
    accessKey: string;
    secretKey: string;
    ipnUrl: string;
    autoCapture: boolean;
    requestType: string;
    lang: string;
}

export interface ISignature {
    accessKey: string;
    amount: number;
    extraData: string;
    ipnUrl: string;
    orderId: string;
    orderInfo: string;
    partnerCode: string;
    redirectUrl: string;
    requestId: string;
    requestType: string;
}

export interface IPaymentMethodResult {
    partnerCode: string;
    order: string;
    requestId: string;
    amount: number;
    responseTime: number;
    message: string;
    resultCode: number;
    payUrl: string;
}

export interface ICreatePaymentMethodBody extends ISignature {
    signature: string;
}

export interface ICreatePaymentMethodData {
    orderId: string;
    amount: number;
    orderInfo: string;
    extraData: string;
}

export interface IMomoPaymentCourse {
    _id: string;
    price: number;
    salePrice: number;
}
export interface IMomoPaymentExtraData {
    courses: IMomoPaymentCourse[];
    userId: string;
    amount: number;
}

@Injectable()
export class MomoService {
    static salePriceFactor = 0.01;
    //
    private prefix = 'https://test-payment.momo.vn';
    private config: IMomoConfig = {
        partnerCode: 'MOMONUKG20220413',
        partnerName: 'ATran',
        storeId: '',
        accessKey: '5l39NbIVXgbgt1zZ',
        secretKey: 'GI3Wihw5zdciTsX8TnYlsbGDRRQkYv1Q',
        ipnUrl: process.env.API_DOMAIN,
        autoCapture: true,
        requestType: 'captureWallet',
        lang: 'vi',
        redirectUrl: `${process.env.API_DOMAIN}/orders-payment/payment-notify`,
    };

    async getPaymentMethodForUser(user: User, cart: Cart): Promise<IPaymentMethodResult> {
        return this.getPaymentMethod(this.getPaymentMethodDataForUser(user, cart));
    }

    getPaymentMethodDataForUser(user: User, cart: Cart): ICreatePaymentMethodData {
        const orderInfo = this.getOrderInfo(user, cart);
        const amount = this.getAmount(cart);
        const data: ICreatePaymentMethodData = {
            orderId: Date.now() + '',
            amount,
            orderInfo,
            extraData: this.getExtraData(user, cart, amount),
        };
        return data;
    }

    private getExtraData(user: User, cart: Cart, amount: number) {
        return Helper.encodeBase64(
            JSON.stringify({
                userId: user._id.toString(),
                amount,
                courses: cart.courses.map((item) => {
                    return {
                        _id: item._id,
                        price: item.basicInfo.price,
                        salePrice: this.getSalePrice(
                            item.basicInfo.currency,
                            item.basicInfo.price,
                            item.promotions
                        ),
                    };
                }),
            } as IMomoPaymentExtraData)
        );
    }

    private getOrderInfo(user: User, cart: Cart) {
        const qty = cart.courses.length;
        const info = `${user.profile.firstName} ${user.profile.lastName} checkout: ${qty} Course`;
        return info;
    }
    private getAmount(cart: Cart) {
        let amount = cart.courses.reduce((prev, current) => {
            return (
                prev +
                this.getMomoSellPrice(
                    current.basicInfo.currency,
                    current.basicInfo.price,
                    current.promotions
                )
            );
        }, 0);
        amount = Math.floor(amount);
        return amount;
    }

    private getMomoSellPrice(currency: string, price: number, promotions: Promotions) {
        let sellPrice = this.getSalePrice(currency, price, promotions);
        if (currency == 'usd') sellPrice *= USD_FACTOR;
        else sellPrice = Math.floor(sellPrice);
        return sellPrice;
    }

    private getSalePrice(currency: string, price: number, promotions: Promotions) {
        let sellPrice = price;
        if (promotions) {
            if (DateHelper.isBetweenTwoDateString(promotions.startAt, promotions.endAt)) {
                sellPrice = promotions.discountPrice;
            }
        }
        sellPrice *= MomoService.salePriceFactor;
        return sellPrice;
    }
    //

    private async getPaymentMethod(data: ICreatePaymentMethodData): Promise<IPaymentMethodResult> {
        const body = this.getCreatePaymentMethodBody(data);
        try {
            const res = await axios.post(`${this.prefix}/v2/gateway/api/create`, body);
            return res.data;
        } catch (e) {
            console.error('failed to get payment methods');
        }
    }

    private getCreatePaymentMethodBody(data: ICreatePaymentMethodData): ICreatePaymentMethodBody {
        const { accessKey, partnerCode, ipnUrl, redirectUrl, requestType } = this.config;
        const requestId = Date.now() + '';
        const signature = this.genSignature({
            ...data,
            requestId,
            accessKey,
            partnerCode,
            ipnUrl,
            requestType,
            redirectUrl,
        });
        return {
            ...this.config,
            ...data,
            requestId,
            signature,
        };
    }

    private genSignature(data: ISignature) {
        //
        const keys = Object.keys(data);
        const sortedKeys = keys.sort();
        const sortedKeysObject = {};
        sortedKeys.forEach((key) => {
            sortedKeysObject[key] = data[key];
        });
        let message = '';
        for (const key in sortedKeysObject) {
            message += `&${key}=${sortedKeysObject[key]}`;
        }
        message = message.slice(1);
        const signature = HashHelper.genSha256Hash(message, this.config.secretKey);
        return signature;
    }
    //
    parsePaymentExtraData(info: any): IMomoPaymentExtraData {
        const data = Helper.decodeBase64(info.extraData);
        if (data) {
            const jsonData = JSON.parse(data);
            // for test
            jsonData.amount /= MomoService.salePriceFactor;
            return jsonData;
        }
    }

    static getSalePrice(salePrice: number) {
        return salePrice / this.salePriceFactor;
    }
}
