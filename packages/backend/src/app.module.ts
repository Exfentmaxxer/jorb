import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TaskModule } from './task/task.module';
import { MemoryModule } from './memory/memory.module';
import { ToolModule } from './tool/tool.module';
import { SessionModule } from './session/session.module';
import { ReasoningModule } from './reasoning/reasoning.module';
import { WebsocketModule } from './websocket/websocket.module';
import { MetricsModule } from './metrics/metrics.module';
import { AuditModule } from './audit/audit.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10) * 1000,
        limit: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
      },
    ]),

    // Core modules
    PrismaModule,
    AuthModule,
    TaskModule,
    MemoryModule,
    ToolModule,
    SessionModule,
    ReasoningModule,
    WebsocketModule,
    MetricsModule,
    AuditModule,
    HealthModule,
  ],
})
export class AppModule {}
