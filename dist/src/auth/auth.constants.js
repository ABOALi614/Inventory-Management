"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_EXPIRES_SECONDS = exports.JWT_SECRET = void 0;
exports.JWT_SECRET = process.env.JWT_SECRET ?? 'dev-jwt-secret-change-in-production';
exports.JWT_EXPIRES_SECONDS = Number(process.env.JWT_EXPIRES_SECONDS ?? 60 * 60 * 8);
//# sourceMappingURL=auth.constants.js.map