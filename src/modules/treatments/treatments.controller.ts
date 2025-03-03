import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TreatmentsService } from './treatments.service';
import {
  CreateTreatmentDto,
  UpdateTreatmentDto,
  CreateTreatmentProgressDto,
  UpdateTreatmentProgressDto
} from './dto/treatment.dto';
// import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';

@Controller('treatments')
@UseGuards(JwtAuthGuard
  // , RolesGuard
)
export class TreatmentsController {
  constructor(private readonly treatmentsService: TreatmentsService) { }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN)
  findAll() {
    return this.treatmentsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.DOCTOR, UserRole.PATIENT)
  findOne(@Param('id') id: string) {
    return this.treatmentsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  create(@Body() createTreatmentDto: CreateTreatmentDto) {
    return this.treatmentsService.create(createTreatmentDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  update(@Param('id') id: string, @Body() updateTreatmentDto: UpdateTreatmentDto) {
    return this.treatmentsService.update(id, updateTreatmentDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.treatmentsService.remove(id);
  }

  @Get('patient/:patientId')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.DOCTOR, UserRole.PATIENT)
  findByPatient(@Param('patientId') patientId: string) {
    return this.treatmentsService.findByPatient(patientId);
  }

  @Get('doctor/:doctorId')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.DOCTOR)
  findByDoctor(@Param('doctorId') doctorId: string) {
    return this.treatmentsService.findByDoctor(doctorId);
  }

  // Treatment progress endpoints
  @Post('progress')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  addProgress(@Body() createProgressDto: CreateTreatmentProgressDto) {
    return this.treatmentsService.addTreatmentProgress(createProgressDto);
  }

  @Patch('progress/:id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  updateProgress(
    @Param('id') id: string,
    @Body() updateProgressDto: UpdateTreatmentProgressDto,
  ) {
    return this.treatmentsService.updateTreatmentProgress(id, updateProgressDto);
  }

  @Delete('progress/:id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  removeProgress(@Param('id') id: string) {
    return this.treatmentsService.removeTreatmentProgress(id);
  }

  @Get(':id/progress')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.DOCTOR, UserRole.PATIENT)
  getProgress(@Param('id') id: string) {
    return this.treatmentsService.getTreatmentProgress(id);
  }
}