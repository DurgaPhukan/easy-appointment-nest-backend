import { IsString, IsInt, IsBoolean, IsOptional, Min, Max, IsUUID } from 'class-validator';

export class CreateAvailabilityDto {
  @IsUUID()
  doctorId: string;

  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsInt()
  @Min(5)
  slotDuration: number;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;
}

export class UpdateAvailabilityDto {
  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  endTime?: string;

  @IsInt()
  @IsOptional()
  @Min(5)
  slotDuration?: number;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;
}

export class AvailabilityResponseDto {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}