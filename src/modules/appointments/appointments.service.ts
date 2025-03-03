import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto/appointment.dto';
import { AppointmentStatus } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) { }

  async findAll() {
    return this.prisma.appointment.findMany({
      include: {
        patient: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        doctor: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        doctor: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        billings: true,
        treatments: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    return appointment;
  }

  async create(createAppointmentDto: CreateAppointmentDto) {
    const { doctorId, patientId, appointmentDate, startTime, endTime } = createAppointmentDto;

    // Check if doctor exists
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
    }

    // Check if patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${patientId} not found`);
    }

    // Check doctor availability for the appointment time
    const appointmentDay = new Date(appointmentDate).getDay();
    const availability = await this.prisma.availability.findFirst({
      where: {
        doctorId,
        dayOfWeek: appointmentDay,
        isAvailable: true,
        startTime: { lte: startTime },
        endTime: { gte: endTime },
      },
    });

    if (!availability) {
      throw new BadRequestException('Doctor is not available at the selected time');
    }

    // Check for conflicting appointments
    const conflictingAppointment = await this.prisma.appointment.findFirst({
      where: {
        doctorId,
        appointmentDate: new Date(appointmentDate),
        OR: [
          {
            startTime: { lte: startTime },
            endTime: { gt: startTime },
          },
          {
            startTime: { lt: endTime },
            endTime: { gte: endTime },
          },
          {
            startTime: { gte: startTime },
            endTime: { lte: endTime },
          },
        ],
        status: {
          in: [AppointmentStatus.CONFIRMED, AppointmentStatus.REQUESTED],
        },
      },
    });

    if (conflictingAppointment) {
      throw new BadRequestException('There is already an appointment scheduled for this time');
    }

    // Create the appointment
    return this.prisma.appointment.create({
      data: createAppointmentDto,
    });
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto) {
    await this.findOne(id);

    const { appointmentDate, startTime, endTime, status } = updateAppointmentDto;

    // If appointment is being rescheduled, check for availability
    if (appointmentDate && startTime && endTime) {
      const appointment = await this.prisma.appointment.findUnique({
        where: { id },
        select: { doctorId: true },
      });

      const appointmentDay = new Date(appointmentDate).getDay();
      const doctorId = appointment.doctorId;

      // Check doctor availability for the new appointment time
      const availability = await this.prisma.availability.findFirst({
        where: {
          doctorId,
          dayOfWeek: appointmentDay,
          isAvailable: true,
          startTime: { lte: startTime },
          endTime: { gte: endTime },
        },
      });

      if (!availability) {
        throw new BadRequestException('Doctor is not available at the selected time for rescheduling');
      }

      // Check for conflicting appointments
      const conflictingAppointment = await this.prisma.appointment.findFirst({
        where: {
          id: { not: id },
          doctorId,
          appointmentDate: new Date(appointmentDate),
          OR: [
            {
              startTime: { lte: startTime },
              endTime: { gt: startTime },
            },
            {
              startTime: { lt: endTime },
              endTime: { gte: endTime },
            },
            {
              startTime: { gte: startTime },
              endTime: { lte: endTime },
            },
          ],
          status: {
            in: [AppointmentStatus.CONFIRMED, AppointmentStatus.REQUESTED],
          },
        },
      });

      if (conflictingAppointment) {
        throw new BadRequestException('There is already an appointment scheduled for this time');
      }
    }

    return this.prisma.appointment.update({
      where: { id },
      data: updateAppointmentDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.appointment.delete({
      where: { id },
    });
  }

  async findByPatient(patientId: string) {
    return this.prisma.appointment.findMany({
      where: { patientId },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        appointmentDate: 'desc',
      },
    });
  }

  async findByDoctor(doctorId: string) {
    return this.prisma.appointment.findMany({
      where: { doctorId },
      include: {
        patient: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        appointmentDate: 'desc',
      },
    });
  }

  async updateStatus(id: string, status: AppointmentStatus) {
    await this.findOne(id);

    return this.prisma.appointment.update({
      where: { id },
      data: { status },
    });
  }
}