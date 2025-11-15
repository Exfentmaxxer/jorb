import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async record(name: string, value: number, unit?: string, labels?: Record<string, any>) {
    return this.prisma.systemMetric.create({
      data: { name, value, unit, labels: labels || {} },
    });
  }

  async getMetrics(name?: string, limit = 100) {
    return this.prisma.systemMetric.findMany({
      where: name ? { name } : undefined,
      take: limit,
      orderBy: { timestamp: 'desc' },
    });
  }

  async getSystemHealth() {
    const now = Date.now();
    const uptime = process.uptime();
    const memory = process.memoryUsage();

    return {
      status: 'healthy',
      uptime,
      timestamp: now,
      memory: {
        rss: memory.rss,
        heapTotal: memory.heapTotal,
        heapUsed: memory.heapUsed,
        external: memory.external,
      },
      nodejs: process.version,
    };
  }
}
