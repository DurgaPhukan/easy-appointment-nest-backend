import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto, UpdateOrganizationDto, AssignDoctorToOrganizationDto } from './dto/organization.dto';
// import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';

@Controller('organizations')
@UseGuards(JwtAuthGuard
  // , RolesGuard
)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) { }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN)
  findAll() {
    return this.organizationsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.DOCTOR, UserRole.PATIENT)
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationsService.create(createOrganizationDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN)
  update(@Param('id') id: string, @Body() updateOrganizationDto: UpdateOrganizationDto) {
    return this.organizationsService.update(id, updateOrganizationDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.organizationsService.remove(id);
  }

  @Post('assign-doctor')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN)
  assignDoctor(@Body() assignDoctorDto: AssignDoctorToOrganizationDto) {
    return this.organizationsService.assignDoctor(assignDoctorDto);
  }

  @Delete(':organizationId/doctors/:doctorId')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN)
  removeDoctor(@Param('doctorId') doctorId: string, @Param('organizationId') organizationId: string) {
    return this.organizationsService.removeDoctor(doctorId, organizationId);
  }

  @Get(':id/doctors')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN, UserRole.DOCTOR, UserRole.PATIENT)
  getDoctors(@Param('id') id: string) {
    return this.organizationsService.getDoctors(id);
  }
}