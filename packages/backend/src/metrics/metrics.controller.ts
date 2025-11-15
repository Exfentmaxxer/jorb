import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';

@ApiTags('metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  async getMetrics(@Query('name') name?: string, @Query('limit') limit?: number) {
    return this.metricsService.getMetrics(name, limit ? parseInt(limit.toString()) : undefined);
  }

  @Get('health')
  async getHealth() {
    return this.metricsService.getSystemHealth();
  }
}
