import { IsDateString, IsDecimal, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaymentStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateBillingDto {
  @IsNotEmpty()
  @IsUUID()
  patientId: string;

  @IsNotEmpty()
  @IsUUID()
  appointmentId: string;

  @IsNotEmpty()
  @IsDecimal()
  @Type(() => Number)
  amount: number;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @IsOptional()
  @IsString()
  invoiceNumber?: string;
}

export class UpdateBillingDto {
  @IsOptional()
  @IsDecimal()
  @Type(() => Number)
  amount?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @IsOptional()
  @IsString()
  invoiceNumber?: string;
}

export class BillingDto {
  id: string;
  patientId: string;
  appointmentId: string;
  amount: number;
  description: string;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  paymentDate?: Date;
  invoiceNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create DTO for doctor payments
export class CreateDoctorPaymentDto {
  @IsNotEmpty()
  @IsUUID()
  doctorId: string;

  @IsNotEmpty()
  @IsDecimal()
  @Type(() => Number)
  amount: number;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsDateString()
  paymentDate: string;

  @IsNotEmpty()
  @IsString()
  paymentMethod: string;

  @IsOptional()
  @IsString()
  reference?: string;
}

export class UpdateDoctorPaymentDto {
  @IsOptional()
  @IsDecimal()
  @Type(() => Number)
  amount?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  reference?: string;
}
