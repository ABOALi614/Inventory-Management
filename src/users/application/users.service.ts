import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmailForAuth(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        isActive: true,
      },
    });
  }

  findActiveById(id: string) {
    return this.prisma.user.findFirst({
      where: { id, isActive: true },
      select: { id: true, email: true, role: true, isActive: true },
    });
  }

  createUser(data: {
    email: string;
    passwordHash: string;
    role: UserRole;
  }) {
    return this.prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        passwordHash: data.passwordHash,
        role: data.role,
      },
      select: { id: true, email: true, role: true },
    });
  }
}
