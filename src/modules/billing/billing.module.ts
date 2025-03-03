import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { PrismaService } from 'prisma/prisma.service';
import { BillingService } from './dto/billing.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [BillingController],
  providers: [BillingService, PrismaService],
  exports: [BillingService],
})
export class BillingModule { }