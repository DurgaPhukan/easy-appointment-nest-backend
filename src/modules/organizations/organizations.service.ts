import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrganizationDto, UpdateOrganizationDto, AssignDoctorToOrganizationDto } from './dto/organization.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) { }

  async findAll() {
    return this.prisma.organization.findMany({
      include: {
        doctorOrganizations: {
          include: {
            doctor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                specialization: true,
              },
            },
          },
        },
        organizationAdmins: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        doctorOrganizations: {
          include: {
            doctor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                specialization: true,
              },
            },
          },
        },
        organizationAdmins: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    return organization;
  }

  async create(createOrganizationDto: CreateOrganizationDto) {
    return this.prisma.organization.create({
      data: createOrganizationDto,
    });
  }

  async update(id: string, updateOrganizationDto: UpdateOrganizationDto) {
    await this.findOne(id);

    return this.prisma.organization.update({
      where: { id },
      data: updateOrganizationDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.organization.delete({
      where: { id },
    });
  }

  async assignDoctor(assignDoctorDto: AssignDoctorToOrganizationDto) {
    const { doctorId, organizationId } = assignDoctorDto;

    // Check if doctor exists
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
    }

    // Check if organization exists
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${organizationId} not found`);
    }

    // Create or update the association
    return this.prisma.doctorOrganization.upsert({
      where: {
        doctorId_organizationId: {
          doctorId,
          organizationId,
        },
      },
      update: {
        isActive: true,
        endDate: null,
      },
      create: {
        doctorId,
        organizationId,
        isActive: true,
      },
    });
  }

  async removeDoctor(doctorId: string, organizationId: string) {
    const doctorOrganization = await this.prisma.doctorOrganization.findUnique({
      where: {
        doctorId_organizationId: {
          doctorId,
          organizationId,
        },
      },
    });

    if (!doctorOrganization) {
      throw new NotFoundException(`Doctor with ID ${doctorId} is not associated with organization ID ${organizationId}`);
    }

    return this.prisma.doctorOrganization.update({
      where: {
        doctorId_organizationId: {
          doctorId,
          organizationId,
        },
      },
      data: {
        isActive: false,
        endDate: new Date(),
      },
    });
  }

  async getDoctors(organizationId: string) {
    const organization = await this.findOne(organizationId);

    return this.prisma.doctorOrganization.findMany({
      where: {
        organizationId,
        isActive: true,
      },
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
    });
  }
}