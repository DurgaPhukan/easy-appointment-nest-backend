import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreatePatientDto, CreatePatientRecordDto, UpdatePatientDto, UpdatePatientRecordDto } from './dto/patient.dto';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) { }

  async createPatient(patientDto: CreatePatientDto) {
    const userExists = await this.prisma.user.findUnique({
      where: { id: patientDto.userId }
    });

    if (!userExists) {
      throw new NotFoundException(`User with ID ${patientDto.userId} not found`);
    }

    const patientExists = await this.prisma.patient.findUnique({
      where: { userId: patientDto.userId }
    });

    if (patientExists) {
      throw new ConflictException(`Patient profile already exists for user ID ${patientDto.userId}`);
    }

    return this.prisma.patient.create({
      data: patientDto
    });
  }

  async getAllPatients() {
    return this.prisma.patient.findMany({
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    });
  }

  async getPatientById(id: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true
          }
        },
        patientRecords: true
      }
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    return patient;
  }

  async updatePatient(id: string, patientDto: UpdatePatientDto) {
    await this.getPatientById(id);

    return this.prisma.patient.update({
      where: { id },
      data: patientDto
    });
  }

  async deletePatient(id: string) {
    await this.getPatientById(id);

    return this.prisma.patient.delete({
      where: { id }
    });
  }

  async getPatientAppointments(patientId: string) {
    await this.getPatientById(patientId);

    return this.prisma.appointment.findMany({
      where: {
        patientId
      },
      include: {
        doctor: {
          select: {
            firstName: true,
            lastName: true,
            specialization: true
          }
        }
      },
      orderBy: {
        appointmentDate: 'desc'
      }
    });
  }

  async getPatientTreatments(patientId: string) {
    await this.getPatientById(patientId);

    return this.prisma.treatment.findMany({
      where: {
        patientId
      },
      include: {
        doctor: {
          select: {
            firstName: true,
            lastName: true,
            specialization: true
          }
        },
        disease: true,
        treatmentProgress: true
      },
      orderBy: {
        startDate: 'desc'
      }
    });
  }

  async getPatientBillings(patientId: string) {
    await this.getPatientById(patientId);

    return this.prisma.billing.findMany({
      where: {
        patientId
      },
      include: {
        appointment: {
          include: {
            doctor: {
              select: {
                firstName: true,
                lastName: true,
                specialization: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  // Patient records methods
  async addPatientRecord(recordDto: CreatePatientRecordDto) {
    await this.getPatientById(recordDto.patientId);

    return this.prisma.patientRecord.create({
      data: recordDto
    });
  }

  async getPatientRecords(patientId: string) {
    await this.getPatientById(patientId);

    return this.prisma.patientRecord.findMany({
      where: {
        patientId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async updatePatientRecord(recordId: string, recordDto: UpdatePatientRecordDto) {
    const record = await this.prisma.patientRecord.findUnique({
      where: { id: recordId }
    });

    if (!record) {
      throw new NotFoundException(`Patient record with ID ${recordId} not found`);
    }

    return this.prisma.patientRecord.update({
      where: { id: recordId },
      data: recordDto
    });
  }

  async deletePatientRecord(recordId: string) {
    const record = await this.prisma.patientRecord.findUnique({
      where: { id: recordId }
    });

    if (!record) {
      throw new NotFoundException(`Patient record with ID ${recordId} not found`);
    }

    return this.prisma.patientRecord.delete({
      where: { id: recordId }
    });
  }
}