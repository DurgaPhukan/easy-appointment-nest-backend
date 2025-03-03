import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateTreatmentDto,
  UpdateTreatmentDto,
  CreateTreatmentProgressDto,
  UpdateTreatmentProgressDto
} from './dto/treatment.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class TreatmentsService {
  constructor(private prisma: PrismaService) { }

  async findAll() {
    return this.prisma.treatment.findMany({
      include: {
        patient: true,
        doctor: true,
        disease: true,
        appointment: true,
        treatmentProgress: true,
      },
    });
  }

  async findOne(id: string) {
    const treatment = await this.prisma.treatment.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: true,
        disease: true,
        appointment: true,
        treatmentProgress: {
          orderBy: {
            date: 'desc',
          },
        },
      },
    });

    if (!treatment) {
      throw new NotFoundException(`Treatment with ID ${id} not found`);
    }

    return treatment;
  }

  async create(createTreatmentDto: CreateTreatmentDto) {
    const { patientId, doctorId, appointmentId, diseaseId } = createTreatmentDto;

    // Check if patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${patientId} not found`);
    }

    // Check if doctor exists
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
    }

    // Check appointment if provided
    if (appointmentId) {
      const appointment = await this.prisma.appointment.findUnique({
        where: { id: appointmentId },
      });

      if (!appointment) {
        throw new NotFoundException(`Appointment with ID ${appointmentId} not found`);
      }
    }

    // Check disease if provided
    if (diseaseId) {
      const disease = await this.prisma.disease.findUnique({
        where: { id: diseaseId },
      });

      if (!disease) {
        throw new NotFoundException(`Disease with ID ${diseaseId} not found`);
      }
    }

    return this.prisma.treatment.create({
      data: createTreatmentDto,
    });
  }

  async update(id: string, updateTreatmentDto: UpdateTreatmentDto) {
    await this.findOne(id);

    const { diseaseId } = updateTreatmentDto;

    // Check disease if provided
    if (diseaseId) {
      const disease = await this.prisma.disease.findUnique({
        where: { id: diseaseId },
      });

      if (!disease) {
        throw new NotFoundException(`Disease with ID ${diseaseId} not found`);
      }
    }

    return this.prisma.treatment.update({
      where: { id },
      data: updateTreatmentDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.treatment.delete({
      where: { id },
    });
  }

  async findByPatient(patientId: string) {
    return this.prisma.treatment.findMany({
      where: { patientId },
      include: {
        doctor: true,
        disease: true,
        treatmentProgress: {
          orderBy: {
            date: 'desc',
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });
  }

  async findByDoctor(doctorId: string) {
    return this.prisma.treatment.findMany({
      where: { doctorId },
      include: {
        patient: true,
        disease: true,
        treatmentProgress: {
          orderBy: {
            date: 'desc',
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });
  }

  // Treatment progress methods
  async addTreatmentProgress(createProgressDto: CreateTreatmentProgressDto) {
    const { treatmentId } = createProgressDto;

    // Check if treatment exists
    const treatment = await this.prisma.treatment.findUnique({
      where: { id: treatmentId },
    });

    if (!treatment) {
      throw new NotFoundException(`Treatment with ID ${treatmentId} not found`);
    }

    return this.prisma.treatmentProgress.create({
      data: createProgressDto,
    });
  }

  async updateTreatmentProgress(progressId: string, updateProgressDto: UpdateTreatmentProgressDto) {
    const progress = await this.prisma.treatmentProgress.findUnique({
      where: { id: progressId },
    });

    if (!progress) {
      throw new NotFoundException(`Treatment progress with ID ${progressId} not found`);
    }

    return this.prisma.treatmentProgress.update({
      where: { id: progressId },
      data: updateProgressDto,
    });
  }

  async removeTreatmentProgress(progressId: string) {
    const progress = await this.prisma.treatmentProgress.findUnique({
      where: { id: progressId },
    });

    if (!progress) {
      throw new NotFoundException(`Treatment progress with ID ${progressId} not found`);
    }

    return this.prisma.treatmentProgress.delete({
      where: { id: progressId },
    });
  }

  async getTreatmentProgress(treatmentId: string) {
    return this.prisma.treatmentProgress.findMany({
      where: { treatmentId },
      orderBy: {
        date: 'desc',
      },
    });
  }
}
