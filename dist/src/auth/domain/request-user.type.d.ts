import { UserRole } from '@prisma/client';
export type RequestUser = {
    userId: string;
    email: string;
    role: UserRole;
};
