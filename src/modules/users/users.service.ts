import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/user.dto';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async findAll(role?: UserRole) {
    const where = role ? { role } : {};

    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return users;
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    let profile = null;
    if (user.role === UserRole.PATIENT) {
      profile = await this.prisma.patient.findUnique({
        where: { userId: id },
      });
    } else if (user.role === UserRole.DOCTOR) {
      profile = await this.prisma.doctor.findUnique({
        where: { userId: id },
      });
    } else if (user.role === UserRole.ORGANIZATION_ADMIN) {
      profile = await this.prisma.organizationAdmin.findUnique({
        where: { userId: id },
        include: { organization: true },
      });
    }

    return {
      ...user,
      profile,
    };
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { password, ...rest } = updateUserDto;

    // Prepare user data for update
    const userData: any = { ...rest };

    // Hash password if provided
    if (password) {
      userData.password = await bcrypt.hash(password, 10);
    }

    // Update user in transaction to handle role-specific data
    const result = await this.prisma.$transaction(async (prisma) => {
      // Update user
      const updatedUser = await prisma.user.update({
        where: { id },
        data: userData,
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Update role-specific profile if profile data is provided
      if (updateUserDto.profile) {
        if (user.role === UserRole.PATIENT) {
          await prisma.patient.update({
            where: { userId: id },
            data: updateUserDto.profile,
          });
        } else if (user.role === UserRole.DOCTOR) {
          await prisma.doctor.update({
            where: { userId: id },
            data: updateUserDto.profile,
          });
        } else if (user.role === UserRole.ORGANIZATION_ADMIN) {
          await prisma.organizationAdmin.update({
            where: { userId: id },
            data: updateUserDto.profile,
          });
        }
      }

      return updatedUser;
    });

    return {
      message: 'User updated successfully',
      user: result,
    };
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return {
      message: 'User deleted successfully',
    };
  }
}