import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { CreateBillingDto, CreateDoctorPaymentDto, UpdateBillingDto, UpdateDoctorPaymentDto } from './billing.dto';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) { }

  async findAll() {
    return this.prisma.billing.findMany({
      include: {
        patient: true,
        appointment: {
          include: {
            doctor: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const billing = await this.prisma.billing.findUnique({
      where: { id },
      include: {
        patient: true,
        appointment: {
          include: {
            doctor: true,
          },
        },
      },
    });

    if (!billing) {
      throw new NotFoundException(`Billing record with ID ${id} not found`);
    }

    return billing;
  }

  async create(createBillingDto: CreateBillingDto) {
    const { patientId, appointmentId } = createBillingDto;

    // Check if patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${patientId} not found`);
    }

    // Check if appointment exists
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${appointmentId} not found`);
    }

    // Check if appointment belongs to the patient
    if (appointment.patientId !== patientId) {
      throw new BadRequestException(`Appointment does not belong to the specified patient`);
    }

    // Generate invoice number if not provided
    if (!createBillingDto.invoiceNumber) {
      const date = new Date();
      const year = date.getFullYear().toString().substr(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      createBillingDto.invoiceNumber = `INV-${year}${month}-${random}`;
    }

    return this.prisma.billing.create({
      data: createBillingDto,
    });
  }

  async update(id: string, updateBillingDto: UpdateBillingDto) {
    await this.findOne(id);

    return this.prisma.billing.update({
      where: { id },
      data: updateBillingDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.billing.delete({
      where: { id },
    });
  }

  async findByPatient(patientId: string) {
    return this.prisma.billing.findMany({
      where: { patientId },
      include: {
        appointment: {
          include: {
            doctor: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updatePaymentStatus(id: string, status: PaymentStatus) {
    await this.findOne(id);

    const data: any = { paymentStatus: status };

    // If status is PAID, add payment date
    if (status === PaymentStatus.PAID) {
      data.paymentDate = new Date();
    }

    return this.prisma.billing.update({
      where: { id },
      data,
    });
  }

  // Doctor payment methods
  async createDoctorPayment(createPaymentDto: CreateDoctorPaymentDto) {
    const { doctorId } = createPaymentDto;

    // Check if doctor exists
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
    }

    return this.prisma.doctorPayment.create({
      data: createPaymentDto,
    });
  }

  async findDoctorPayments(doctorId: string) {
    // Check if doctor exists
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
    }

    return this.prisma.doctorPayment.findMany({
      where: { doctorId },
      orderBy: {
        paymentDate: 'desc',
      },
    });
  }

  async updateDoctorPayment(id: string, updatePaymentDto: UpdateDoctorPaymentDto) {
    const payment = await this.prisma.doctorPayment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException(`Doctor payment with ID ${id} not found`);
    }

    return this.prisma.doctorPayment.update({
      where: { id },
      data: updatePaymentDto,
    });
  }

  async removeDoctorPayment(id: string) {
    const payment = await this.prisma.doctorPayment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException(`Doctor payment with ID ${id} not found`);
    }

    return this.prisma.doctorPayment.delete({
      where: { id },
    });
  }

  async getDoctorPaymentsSummary(doctorId: string, startDate: Date, endDate: Date) {
    // Check if doctor exists
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
    }

    const payments = await this.prisma.doctorPayment.findMany({
      where: {
        doctorId,
        paymentDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalAmount = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const count = payments.length;

    return {
      doctorId,
      totalAmount,
      count,
      startDate,
      endDate,
    };
  }
}

