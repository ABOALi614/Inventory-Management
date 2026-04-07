import { AuthService } from '../application/auth.service';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    login(dto: LoginDto): Promise<LoginResponseDto>;
}
