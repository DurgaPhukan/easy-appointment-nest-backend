import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CreateDoctorDto, UpdateDoctorDto } from './dto/doctor.dto';
import { AuthGuard } from '@nestjs/passport';
import { CreateAvailabilityDto, UpdateAvailabilityDto } from './dto/availability.dto';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  async createDoctor(@Body() doctorDto: CreateDoctorDto) {
    return this.doctorsService.createDoctor(doctorDto);
  }

  @Get()
  async getAllDoctors(@Query('specialization') specialization?: string, @Query('organizationId') organizationId?: string) {
    return this.doctorsService.getAllDoctors(specialization, organizationId);
  }

  @Get(':id')
  async getDoctorById(@Param('id') id: string) {
    return this.doctorsService.getDoctorById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  async updateDoctor(@Param('id') id: string, @Body() doctorDto: UpdateDoctorDto) {
    return this.doctorsService.updateDoctor(id, doctorDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  async deleteDoctor(@Param('id') id: string) {
    return this.doctorsService.deleteDoctor(id);
  }

  @Post(':doctorId/organizations/:organizationId')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN)
  async addDoctorToOrganization(
    @Param('doctorId') doctorId: string,
    @Param('organizationId') organizationId: string
  ) {
    return this.doctorsService.addDoctorToOrganization(doctorId, organizationId);
  }

  @Delete(':doctorId/organizations/:organizationId')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN)
  async removeDoctorFromOrganization(
    @Param('doctorId') doctorId: string,
    @Param('organizationId') organizationId: string
  ) {
    return this.doctorsService.removeDoctorFromOrganization(doctorId, organizationId);
  }

  @Get(':id/organizations')
  async getDoctorOrganizations(@Param('id') doctorId: string) {
    return this.doctorsService.getDoctorOrganizations(doctorId);
  }

  // Availability endpoints
  @Post(':id/availability')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  async addAvailability(@Param('id') doctorId: string, @Body() availabilityDto: CreateAvailabilityDto) {
    availabilityDto.doctorId = doctorId;
    return this.doctorsService.addAvailability(availabilityDto);
  }

  @Get(':id/availability')
  async getDoctorAvailability(@Param('id') doctorId: string) {
    return this.doctorsService.getDoctorAvailability(doctorId);
  }

  @Put('availability/:id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  async updateAvailability(@Param('id') availabilityId: string, @Body() availabilityDto: UpdateAvailabilityDto) {
    return this.doctorsService.updateAvailability(availabilityId, availabilityDto);
  }

  @Delete('availability/:id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  async deleteAvailability(@Param('id') availabilityId: string) {
    return this.doctorsService.deleteAvailability(availabilityId);
  }
}
