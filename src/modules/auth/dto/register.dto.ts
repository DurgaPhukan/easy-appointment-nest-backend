import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsDate,
  IsInt,
  IsNumber,
  IsPositive,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole, Gender } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'StrongPassword123',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    example: UserRole.PATIENT,
  })
  @IsEnum(UserRole, { message: 'Invalid role' })
  @IsNotEmpty({ message: 'Role is required' })
  role: UserRole;

  @ApiProperty({
    description: 'First name',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+1234567890',
  })
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  phone: string;

  // Patient specific fields
  @ApiProperty({
    description: 'Date of birth (for patients)',
    required: false,
    example: '1990-01-01',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @ValidateIf((o) => o.role === UserRole.PATIENT)
  dateOfBirth?: Date;

  @ApiProperty({
    description: 'Gender (for patients)',
    enum: Gender,
    required: false,
    example: Gender.MALE,
  })
  @IsOptional()
  @IsEnum(Gender, { message: 'Invalid gender' })
  @ValidateIf((o) => o.role === UserRole.PATIENT)
  gender?: Gender;

  @ApiProperty({
    description: 'Address (for patients)',
    required: false,
    example: '123 Main St, City, Country',
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.role === UserRole.PATIENT)
  address?: string;

  // Doctor specific fields
  @ApiProperty({
    description: 'Specialization (for doctors)',
    required: false,
    example: 'Cardiology',
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.role === UserRole.DOCTOR)
  specialization?: string;

  @ApiProperty({
    description: 'Qualification (for doctors)',
    required: false,
    example: 'MD, PhD',
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.role === UserRole.DOCTOR)
  qualification?: string;

  @ApiProperty({
    description: 'Years of experience (for doctors)',
    required: false,
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @ValidateIf((o) => o.role === UserRole.DOCTOR)
  experience?: number;

  @ApiProperty({
    description: 'Bio (for doctors)',
    required: false,
    example: 'Experienced doctor specializing in cardiology',
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.role === UserRole.DOCTOR)
  bio?: string;

  @ApiProperty({
    description: 'Consultation fee (for doctors)',
    required: false,
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @ValidateIf((o) => o.role === UserRole.DOCTOR)
  consultationFee?: number;

  // Organization Admin specific fields
  @ApiProperty({
    description: 'Organization ID (for organization admins)',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  @ValidateIf((o) => o.role === UserRole.ORGANIZATION_ADMIN)
  organizationId?: string;
}