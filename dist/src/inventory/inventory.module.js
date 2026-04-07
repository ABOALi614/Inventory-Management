"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("../auth/auth.module");
const jobs_module_1 = require("../jobs/jobs.module");
const ledger_module_1 = require("../ledger/ledger.module");
const stock_movement_service_1 = require("./application/stock-movement.service");
const stock_movement_controller_1 = require("./presentation/stock-movement.controller");
let InventoryModule = class InventoryModule {
};
exports.InventoryModule = InventoryModule;
exports.InventoryModule = InventoryModule = __decorate([
    (0, common_1.Module)({
        imports: [ledger_module_1.LedgerModule, auth_module_1.AuthModule, jobs_module_1.JobsModule],
        controllers: [stock_movement_controller_1.StockMovementController],
        providers: [stock_movement_service_1.StockMovementService],
        exports: [stock_movement_service_1.StockMovementService],
    })
], InventoryModule);
//# sourceMappingURL=inventory.module.js.map