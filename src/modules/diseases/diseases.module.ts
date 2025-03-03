import { Module } from '@nestjs/common';
import { DiseasesService } from './diseases.service';
import { DiseasesController } from './diseases.controller';
import { PrismaService } from 'prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [DiseasesController],
  providers: [DiseasesService, PrismaService],
  exports: [DiseasesService],
})
export class DiseasesModule { }
