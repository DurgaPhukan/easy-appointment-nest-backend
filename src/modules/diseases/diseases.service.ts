import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDiseaseDto, UpdateDiseaseDto } from './dto/disease.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class DiseasesService {
  constructor(private prisma: PrismaService) { }

  async findAll() {
    return this.prisma.disease.findMany();
  }

  async findOne(id: string) {
    const disease = await this.prisma.disease.findUnique({
      where: { id },
      include: {
        treatments: {
          include: {
            patient: true,
            doctor: true,
          },
        },
      },
    });

    if (!disease) {
      throw new NotFoundException(`Disease with ID ${id} not found`);
    }

    return disease;
  }

  async create(createDiseaseDto: CreateDiseaseDto) {
    return this.prisma.disease.create({
      data: createDiseaseDto,
    });
  }

  async update(id: string, updateDiseaseDto: UpdateDiseaseDto) {
    await this.findOne(id);

    return this.prisma.disease.update({
      where: { id },
      data: updateDiseaseDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.disease.delete({
      where: { id },
    });
  }

  async findByName(name: string) {
    return this.prisma.disease.findMany({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
    });
  }
}
