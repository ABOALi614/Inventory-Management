"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockMovementController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const stock_movement_service_1 = require("../application/stock-movement.service");
const stock_movement_dto_1 = require("./dto/stock-movement.dto");
let StockMovementController = class StockMovementController {
    constructor(stockMovement) {
        this.stockMovement = stockMovement;
    }
    add(user, dto) {
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
    remove(user, dto) {
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
};
exports.StockMovementController = StockMovementController;
__decorate([
    (0, common_1.Post)('add'),
    (0, swagger_1.ApiOperation)({ summary: 'Inbound stock (creates ledger entry + updates position)' }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Stock added', type: stock_movement_dto_1.StockMovementResultDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, stock_movement_dto_1.AddStockDto]),
    __metadata("design:returntype", Promise)
], StockMovementController.prototype, "add", null);
__decorate([
    (0, common_1.Post)('remove'),
    (0, swagger_1.ApiOperation)({
        summary: 'Outbound stock (validates balance, ledger entry, optimistic version)',
    }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Stock removed',
        type: stock_movement_dto_1.StockMovementResultDto,
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, stock_movement_dto_1.RemoveStockDto]),
    __metadata("design:returntype", Promise)
], StockMovementController.prototype, "remove", null);
exports.StockMovementController = StockMovementController = __decorate([
    (0, swagger_1.ApiTags)('inventory'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.PICKER),
    (0, common_1.Controller)('inventory/stock'),
    __metadata("design:paramtypes", [stock_movement_service_1.StockMovementService])
], StockMovementController);
//# sourceMappingURL=stock-movement.controller.js.map