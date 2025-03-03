import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateDoctorDto, UpdateDoctorDto } from './dto/doctor.dto';
import { CreateAvailabilityDto, UpdateAvailabilityDto } from './dto/availability.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) { }

  async createDoctor(doctorDto: CreateDoctorDto) {
    const userExists = await this.prisma.user.findUnique({
      where: { id: doctorDto.userId }
    });

    if (!userExists) {
      throw new NotFoundException(`User with ID ${doctorDto.userId} not found`);
    }

    const doctorExists = await this.prisma.doctor.findUnique({
      where: { userId: doctorDto.userId }
    });

    if (doctorExists) {
      throw new ConflictException(`Doctor profile already exists for user ID ${doctorDto.userId}`);
    }

    return this.prisma.doctor.create({
      data: doctorDto
    });
  }

  async getAllDoctors(specialization?: string, organizationId?: string) {
    let whereClause = {};

    if (specialization) {
      whereClause = {
        ...whereClause,
        specialization
      };
    }

    if (organizationId) {
      return this.prisma.doctor.findMany({
        where: {
          ...whereClause,
          doctorOrganizations: {
            some: {
              organizationId,
              isActive: true
            }
          }
        },
        include: {
          user: {
            select: {
              email: true
            }
          },
          availabilities: true
        }
      });
    }

    return this.prisma.doctor.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            email: true
          }
        },
        availabilities: true
      }
    });
  }

  async getDoctorById(id: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true
          }
        },
        availabilities: true,
        doctorOrganizations: {
          include: {
            organization: true
          }
        }
      }
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }

    return doctor;
  }

  async updateDoctor(id: string, doctorDto: UpdateDoctorDto) {
    await this.getDoctorById(id);

    return this.prisma.doctor.update({
      where: { id },
      data: doctorDto
    });
  }

  async deleteDoctor(id: string) {
    await this.getDoctorById(id);

    return this.prisma.doctor.delete({
      where: { id }
    });
  }

  async addDoctorToOrganization(doctorId: string, organizationId: string) {
    // Check if doctor exists
    await this.getDoctorById(doctorId);

    // Check if organization exists
    const organizationExists = await this.prisma.organization.findUnique({
      where: { id: organizationId }
    });

    if (!organizationExists) {
      throw new NotFoundException(`Organization with ID ${organizationId} not found`);
    }

    // Check if relation already exists
    const existingRelation = await this.prisma.doctorOrganization.findUnique({
      where: {
        doctorId_organizationId: {
          doctorId,
          organizationId
        }
      }
    });

    if (existingRelation) {
      if (existingRelation.isActive) {
        throw new ConflictException(`Doctor is already associated with this organization`);
      } else {
        // Reactivate the relation
        return this.prisma.doctorOrganization.update({
          where: {
            id: existingRelation.id
          },
          data: {
            isActive: true,
            endDate: null
          }
        });
      }
    }

    return this.prisma.doctorOrganization.create({
      data: {
        doctorId,
        organizationId
      }
    });
  }

  async removeDoctorFromOrganization(doctorId: string, organizationId: string) {
    const relation = await this.prisma.doctorOrganization.findUnique({
      where: {
        doctorId_organizationId: {
          doctorId,
          organizationId
        }
      }
    });

    if (!relation) {
      throw new NotFoundException(`Doctor is not associated with this organization`);
    }

    return this.prisma.doctorOrganization.update({
      where: {
        id: relation.id
      },
      data: {
        isActive: false,
        endDate: new Date()
      }
    });
  }

  async getDoctorOrganizations(doctorId: string) {
    await this.getDoctorById(doctorId);

    return this.prisma.doctorOrganization.findMany({
      where: {
        doctorId,
        isActive: true
      },
      include: {
        organization: true
      }
    });
  }

  // Availability methods
  async addAvailability(availabilityDto: CreateAvailabilityDto) {
    await this.getDoctorById(availabilityDto.doctorId);

    return this.prisma.availability.create({
      data: availabilityDto
    });
  }

  async getDoctorAvailability(doctorId: string) {
    await this.getDoctorById(doctorId);

    return this.prisma.availability.findMany({
      where: {
        doctorId
      },
      orderBy: {
        dayOfWeek: 'asc'
      }
    });
  }

  async updateAvailability(availabilityId: string, availabilityDto: UpdateAvailabilityDto) {
    const availability = await this.prisma.availability.findUnique({
      where: { id: availabilityId }
    });

    if (!availability) {
      throw new NotFoundException(`Availability with ID ${availabilityId} not found`);
    }

    return this.prisma.availability.update({
      where: { id: availabilityId },
      data: availabilityDto
    });
  }

  async deleteAvailability(availabilityId: string) {
    const availability = await this.prisma.availability.findUnique({
      where: { id: availabilityId }
    });

    if (!availability) {
      throw new NotFoundException(`Availability with ID ${availabilityId} not found`);
    }

    return this.prisma.availability.delete({
      where: { id: availabilityId }
    });
  }
}