import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import {
  CreateBillingDto,
  UpdateBillingDto,
  CreateDoctorPaymentDto,
  UpdateDoctorPaymentDto
} from './dto/billing.dto';
// import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
// import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, PaymentStatus } from '@prisma/client';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { BillingService } from './dto/billing.service';

@Controller('billing')
@UseGuards(JwtAuthGuard
  // , RolesGuard
)
export class BillingController {
  constructor(private readonly billingService: BillingService) { }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.STAFF)
  findAll() {
    return this.billingService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.PATIENT, UserRole.STAFF)
  findOne(@Param('id') id: string) {
    return this.billingService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.STAFF)
  create(@Body() createBillingDto: CreateBillingDto) {
    return this.billingService.create(createBillingDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.STAFF)
  update(@Param('id') id: string, @Body() updateBillingDto: UpdateBillingDto) {
    return this.billingService.update(id, updateBillingDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.billingService.remove(id);
  }

  @Get('patient/:patientId')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.PATIENT, UserRole.STAFF)
  findByPatient(@Param('patientId') patientId: string) {
    return this.billingService.findByPatient(patientId);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.STAFF)
  updateStatus(
    @Param('id') id: string,
    @Query('status') status: PaymentStatus,
  ) {
    return this.billingService.updatePaymentStatus(id, status);
  }

  // Doctor payment endpoints
  @Post('doctor-payments')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN)
  createDoctorPayment(@Body() createPaymentDto: CreateDoctorPaymentDto) {
    return this.billingService.createDoctorPayment(createPaymentDto);
  }

  @Get('doctor-payments/:doctorId')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.DOCTOR)
  getDoctorPayments(@Param('doctorId') doctorId: string) {
    return this.billingService.findDoctorPayments(doctorId);
  }

  @Patch('doctor-payments/:id')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN)
  updateDoctorPayment(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdateDoctorPaymentDto,
  ) {
    return this.billingService.updateDoctorPayment(id, updatePaymentDto);
  }

  @Delete('doctor-payments/:id')
  @Roles(UserRole.ADMIN)
  removeDoctorPayment(@Param('id') id: string) {
    return this.billingService.removeDoctorPayment(id);
  }

  @Get('doctor-payments/:doctorId/summary')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.DOCTOR)
  getDoctorPaymentsSummary(
    @Param('doctorId') doctorId: string,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    return this.billingService.getDoctorPaymentsSummary(doctorId, startDate, endDate);
  }
}

