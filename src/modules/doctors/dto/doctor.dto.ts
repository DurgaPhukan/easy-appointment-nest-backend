import { IsString, IsInt, IsNumber, IsOptional, IsUUID, Min, IsDecimal } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateDoctorDto {
  @IsUUID()
  userId: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  specialization: string;

  @IsString()
  qualification: string;

  @IsInt()
  @Min(0)
  experience: number;

  @IsString()
  phone: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  profileImage?: string;

  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  consultationFee: number;
}

export class UpdateDoctorDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  specialization?: string;

  @IsString()
  @IsOptional()
  qualification?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  experience?: number;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  profileImage?: string;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  consultationFee?: number;
}

export class DoctorResponseDto {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  specialization: string;
  qualification: string;
  experience: number;
  phone: string;
  bio?: string;
  profileImage?: string;
  consultationFee: number;
  createdAt: Date;
  updatedAt: Date;
}