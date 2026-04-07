import { RequestUser } from '../../auth/domain/request-user.type';
import { StockMovementService } from '../application/stock-movement.service';
import { AddStockDto, RemoveStockDto, StockMovementResultDto } from './dto/stock-movement.dto';
export declare class StockMovementController {
    private readonly stockMovement;
    constructor(stockMovement: StockMovementService);
    add(user: RequestUser, dto: AddStockDto): Promise<StockMovementResultDto>;
    remove(user: RequestUser, dto: RemoveStockDto): Promise<StockMovementResultDto>;
}
