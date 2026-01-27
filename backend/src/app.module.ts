import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerStorageRedisService } from './common/throttler-storage-redis.service';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma.service';
import { ReportsModule } from './reports/reports.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './admin/admin.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { LabsModule } from './labs/labs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [{
          ttl: 60000, // 1 minute
          limit: 100, // 100 requests
        }],
        storage: new ThrottlerStorageRedisService(config),
      }),
    }),
    AuthModule,
    ReportsModule,
    AnalyticsModule,
    NotificationsModule,
    AdminModule,
    ChatbotModule,
    LabsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    ThrottlerStorageRedisService,
    PrismaService,
  ],
})
export class AppModule { }
