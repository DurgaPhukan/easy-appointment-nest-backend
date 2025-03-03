import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTreatmentDto {
  @IsNotEmpty()
  @IsUUID()
  patientId: string;

  @IsNotEmpty()
  @IsUUID()
  doctorId: string;

  @IsOptional()
  @IsUUID()
  appointmentId?: string;

  @IsOptional()
  @IsUUID()
  diseaseId?: string;

  @IsNotEmpty()
  @IsString()
  diagnosis: string;

  @IsOptional()
  @IsString()
  prescription?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class UpdateTreatmentDto {
  @IsOptional()
  @IsUUID()
  diseaseId?: string;

  @IsOptional()
  @IsString()
  diagnosis?: string;

  @IsOptional()
  @IsString()
  prescription?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class TreatmentDto {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  diseaseId?: string;
  diagnosis: string;
  prescription?: string;
  notes?: string;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Add Treatment Progress DTO
export class CreateTreatmentProgressDto {
  @IsNotEmpty()
  @IsUUID()
  treatmentId: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateTreatmentProgressDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

