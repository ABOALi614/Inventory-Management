export declare class LoginDto {
    email: string;
    password: string;
}
export declare class LoginResponseDto {
    access_token: string;
    user: {
        id: string;
        email: string;
        role: string;
    };
}
