import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CreatePatientDto, CreatePatientRecordDto, UpdatePatientDto, UpdatePatientRecordDto } from './dto/patient.dto';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  async createPatient(@Body() patientDto: CreatePatientDto) {
    return this.patientsService.createPatient(patientDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.ORGANIZATION_ADMIN)
  async getAllPatients() {
    return this.patientsService.getAllPatients();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT, UserRole.ORGANIZATION_ADMIN)
  async getPatientById(@Param('id') id: string) {
    return this.patientsService.getPatientById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.PATIENT)
  async updatePatient(@Param('id') id: string, @Body() patientDto: UpdatePatientDto) {
    return this.patientsService.updatePatient(id, patientDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  async deletePatient(@Param('id') id: string) {
    return this.patientsService.deletePatient(id);
  }

  @Get(':id/appointments')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT)
  async getPatientAppointments(@Param('id') patientId: string) {
    return this.patientsService.getPatientAppointments(patientId);
  }

  @Get(':id/treatments')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT)
  async getPatientTreatments(@Param('id') patientId: string) {
    return this.patientsService.getPatientTreatments(patientId);
  }

  @Get(':id/billings')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.PATIENT)
  async getPatientBillings(@Param('id') patientId: string) {
    return this.patientsService.getPatientBillings(patientId);
  }

  // Patient records endpoints
  @Post(':id/records')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  async addPatientRecord(@Param('id') patientId: string, @Body() recordDto: CreatePatientRecordDto) {
    recordDto.patientId = patientId;
    return this.patientsService.addPatientRecord(recordDto);
  }

  @Get(':id/records')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT)
  async getPatientRecords(@Param('id') patientId: string) {
    return this.patientsService.getPatientRecords(patientId);
  }

  @Put('records/:id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  async updatePatientRecord(@Param('id') recordId: string, @Body() recordDto: UpdatePatientRecordDto) {
    return this.patientsService.updatePatientRecord(recordId, recordDto);
  }

  @Delete('records/:id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  async deletePatientRecord(@Param('id') recordId: string) {
    return this.patientsService.deletePatientRecord(recordId);
  }
}
