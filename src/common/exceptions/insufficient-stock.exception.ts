import { HttpException, HttpStatus } from '@nestjs/common';

export class InsufficientStockException extends HttpException {
  constructor(
    productId: string,
    locationId: string,
    requested: string,
    available: string,
  ) {
    super(
      {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        error: 'InsufficientStock',
        message: `Not enough stock for product "${productId}" at location "${locationId}". Requested ${requested}, available ${available}.`,
        productId,
        locationId,
        requested,
        available,
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}
