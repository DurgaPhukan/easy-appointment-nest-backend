import { Module } from '@nestjs/common';
import { TreatmentsService } from './treatments.service';
import { TreatmentsController } from './treatments.controller';
import { PrismaService } from 'prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [TreatmentsController],
  providers: [TreatmentsService, PrismaService],
  exports: [TreatmentsService],
})
export class TreatmentsModule { }