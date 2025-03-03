import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto/appointment.dto';
// import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
// import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { UserRole, AppointmentStatus } from '@prisma/client';

@Controller('appointments')
@UseGuards(JwtAuthGuard,
  // RolesGuard
)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) { }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN)
  findAll() {
    return this.appointmentsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.DOCTOR, UserRole.PATIENT)
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.PATIENT, UserRole.STAFF)
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.DOCTOR, UserRole.PATIENT, UserRole.STAFF)
  update(@Param('id') id: string, @Body() updateAppointmentDto: UpdateAppointmentDto) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.STAFF)
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }

  @Get('patient/:patientId')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.DOCTOR, UserRole.PATIENT, UserRole.STAFF)
  findByPatient(@Param('patientId') patientId: string) {
    return this.appointmentsService.findByPatient(patientId);
  }

  @Get('doctor/:doctorId')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.DOCTOR, UserRole.STAFF)
  findByDoctor(@Param('doctorId') doctorId: string) {
    return this.appointmentsService.findByDoctor(doctorId);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.DOCTOR, UserRole.STAFF)
  updateStatus(
    @Param('id') id: string,
    @Query('status') status: AppointmentStatus,
  ) {
    return this.appointmentsService.updateStatus(id, status);
  }
}