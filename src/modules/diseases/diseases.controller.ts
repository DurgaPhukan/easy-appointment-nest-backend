import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { DiseasesService } from './diseases.service';
import { CreateDiseaseDto, UpdateDiseaseDto } from './dto/disease.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';

@Controller('diseases')
@UseGuards(JwtAuthGuard,
  // RolesGuard
)
export class DiseasesController {
  constructor(private readonly diseasesService: DiseasesService) { }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.DOCTOR, UserRole.STAFF)
  findAll() {
    return this.diseasesService.findAll();
  }

  @Get('search')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.DOCTOR, UserRole.STAFF)
  findByName(@Query('name') name: string) {
    return this.diseasesService.findByName(name);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.DOCTOR, UserRole.STAFF)
  findOne(@Param('id') id: string) {
    return this.diseasesService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  create(@Body() createDiseaseDto: CreateDiseaseDto) {
    return this.diseasesService.create(createDiseaseDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  update(@Param('id') id: string, @Body() updateDiseaseDto: UpdateDiseaseDto) {
    return this.diseasesService.update(id, updateDiseaseDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.diseasesService.remove(id);
  }
}