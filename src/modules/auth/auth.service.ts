import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async register(registerDto: RegisterDto) {
    const { email, password, role, ...userData } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in transaction to handle role-specific data
    const result = await this.prisma.$transaction(async (prisma) => {
      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role,
        },
      });

      // Create role-specific profile
      if (role === UserRole.PATIENT) {
        await prisma.patient.create({
          data: {
            userId: user.id,
            ...userData as Prisma.PatientUncheckedCreateInput,
          },
        });
      } else if (role === UserRole.DOCTOR) {
        await prisma.doctor.create({
          data: {
            userId: user.id,
            ...userData as Prisma.DoctorUncheckedCreateInput,
          },
        });
      } else if (role === UserRole.ORGANIZATION_ADMIN) {
        await prisma.organizationAdmin.create({
          data: {
            userId: user.id,
            ...userData as Prisma.OrganizationAdminUncheckedCreateInput,
          },
        });
      }

      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return {
      message: 'User registered successfully',
      user: result,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    const payload = { id: user.id, email: user.email, role: user.role };

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        secret: this.configService.get('jwt.secret'),
        expiresIn: '7d',
      }),
      user,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('jwt.secret'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.id },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      const newPayload = { id: user.id, email: user.email, role: user.role };

      return {
        accessToken: this.jwtService.sign(newPayload),
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...userWithoutPassword } = user;

    let profile = null;
    if (user.role === UserRole.PATIENT) {
      profile = await this.prisma.patient.findUnique({
        where: { userId },
      });
    } else if (user.role === UserRole.DOCTOR) {
      profile = await this.prisma.doctor.findUnique({
        where: { userId },
      });
    } else if (user.role === UserRole.ORGANIZATION_ADMIN) {
      profile = await this.prisma.organizationAdmin.findUnique({
        where: { userId },
        include: { organization: true },
      });
    }

    return {
      ...userWithoutPassword,
      profile,
    };
  }
}