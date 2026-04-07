import { Strategy } from 'passport-jwt';
import { UsersService } from '../../users/application/users.service';
import { JwtPayload } from '../domain/jwt-payload.interface';
import { RequestUser } from '../domain/request-user.type';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly users;
    constructor(users: UsersService);
    validate(payload: JwtPayload): Promise<RequestUser>;
}
export {};
