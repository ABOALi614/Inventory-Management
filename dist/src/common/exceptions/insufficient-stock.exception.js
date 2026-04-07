"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsufficientStockException = void 0;
const common_1 = require("@nestjs/common");
class InsufficientStockException extends common_1.HttpException {
    constructor(productId, locationId, requested, available) {
        super({
            statusCode: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
            error: 'InsufficientStock',
            message: `Not enough stock for product "${productId}" at location "${locationId}". Requested ${requested}, available ${available}.`,
            productId,
            locationId,
            requested,
            available,
        }, common_1.HttpStatus.UNPROCESSABLE_ENTITY);
    }
}
exports.InsufficientStockException = InsufficientStockException;
//# sourceMappingURL=insufficient-stock.exception.js.map