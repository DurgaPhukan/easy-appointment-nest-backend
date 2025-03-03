import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDiseaseDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  symptoms?: string;
}

export class UpdateDiseaseDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  symptoms?: string;
}

export class DiseaseDto {
  id: string;
  name: string;
  description?: string;
  symptoms?: string;
  createdAt: Date;
  updatedAt: Date;
}
