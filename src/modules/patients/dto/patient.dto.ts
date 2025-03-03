import { IsString, IsDate, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { Gender } from '@prisma/client';

export class CreatePatientDto {
  @IsUUID()
  userId: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  dateOfBirth: Date;

  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  phone: string;

  @IsString()
  @IsOptional()
  address?: string;
}

export class UpdatePatientDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsDate()
  @IsOptional()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  dateOfBirth?: Date;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;
}

export class PatientResponseDto {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: Gender;
  phone: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create record DTO
export class CreatePatientRecordDto {
  @IsUUID()
  patientId: string;

  @IsString()
  recordType: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  attachmentUrl?: string;
}

export class UpdatePatientRecordDto {
  @IsString()
  @IsOptional()
  recordType?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  attachmentUrl?: string;
}