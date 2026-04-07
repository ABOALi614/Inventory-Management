import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/application/users.service';
export declare class AuthService {
    private readonly users;
    private readonly jwt;
    constructor(users: UsersService, jwt: JwtService);
    login(email: string, password: string): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    }>;
}
