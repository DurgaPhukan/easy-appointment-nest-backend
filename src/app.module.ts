import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import configuration from './config/configuration';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DoctorsModule } from './modules/doctors/doctors.module';
import { PatientsModule } from './modules/patients/patients.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { JwtAuthGuard } from './common/guards/auth.guard';
import { DiseasesModule } from './modules/diseases/diseases.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { BillingModule } from './modules/billing/billing.module';
import { TreatmentsModule } from './modules/treatments/treatments.module';
import { SupabaseService } from './common/services/supabase.service';
import { HttpExceptionFilter } from './common/filters/http-exception-filters';
import { PrismaModule } from "../prisma/prisma.module"

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60, limit: 10 }]),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    DoctorsModule,
    PatientsModule,
    OrganizationsModule,
    AppointmentsModule,
    DiseasesModule,
    TreatmentsModule,
    BillingModule,

    // FeedbackModule,
    // NotificationsModule,
    // MessagingModule,
    // AnalyticsModule,
  ],
  providers: [
    SupabaseService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [SupabaseService],
})
export class AppModule { }