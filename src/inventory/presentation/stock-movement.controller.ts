import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { RequestUser } from '../../auth/domain/request-user.type';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { StockMovementService } from '../application/stock-movement.service';
import {
  AddStockDto,
  RemoveStockDto,
  StockMovementResultDto,
} from './dto/stock-movement.dto';

@ApiTags('inventory')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.PICKER)
@Controller('inventory/stock')
export class StockMovementController {
  constructor(private readonly stockMovement: StockMovementService) {}

  @Post('add')
  @ApiOperation({ summary: 'Inbound stock (creates ledger entry + updates position)' })
  @ApiCreatedResponse({ description: 'Stock added', type: StockMovementResultDto })
  add(
    @CurrentUser() user: RequestUser,
    @Body() dto: AddStockDto,
  ): Promise<StockMovementResultDto> {
    return this.stockMovement.addStock({
      productId: dto.productId,
      locationId: dto.locationId,
      quantity: dto.quantity,
      performedByUserId: user.userId,
      referenceKind: dto.referenceKind,
      referenceId: dto.referenceId,
      idempotencyKey: dto.idempotencyKey,
    });
  }

  @Post('remove')
  @ApiOperation({
    summary: 'Outbound stock (validates balance, ledger entry, optimistic version)',
  })
  @ApiCreatedResponse({
    description: 'Stock removed',
    type: StockMovementResultDto,
  })
  remove(
    @CurrentUser() user: RequestUser,
    @Body() dto: RemoveStockDto,
  ): Promise<StockMovementResultDto> {
    return this.stockMovement.removeStock({
      productId: dto.productId,
      locationId: dto.locationId,
      quantity: dto.quantity,
      performedByUserId: user.userId,
      referenceKind: dto.referenceKind,
      referenceId: dto.referenceId,
      idempotencyKey: dto.idempotencyKey,
    });
  }
}
