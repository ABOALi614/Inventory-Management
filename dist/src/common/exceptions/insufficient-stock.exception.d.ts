import { HttpException } from '@nestjs/common';
export declare class InsufficientStockException extends HttpException {
    constructor(productId: string, locationId: string, requested: string, available: string);
}
