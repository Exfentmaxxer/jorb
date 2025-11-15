import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { MemoryService } from './memory.service';

@Injectable()
export class MemoryPruningService {
  private readonly logger = new Logger(MemoryPruningService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly memoryService: MemoryService,
  ) {}

  /**
   * Run automatic memory consolidation every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async autoConsolidate(): Promise<void> {
    this.logger.log('Running automatic memory consolidation');

    try {
      // Get all active users
      const users = await this.prisma.user.findMany({
        where: { isActive: true },
        select: { id: true },
      });

      let totalPromoted = 0;

      for (const user of users) {
        const result = await this.memoryService.consolidate(user.id);
        totalPromoted += result.promoted;
      }

      this.logger.log(`Consolidation complete: ${totalPromoted} memories promoted`);
    } catch (error) {
      this.logger.error('Auto consolidation failed:', error);
    }
  }

  /**
   * Run automatic memory pruning every 6 hours
   */
  @Cron(CronExpression.EVERY_6_HOURS)
  async autoPrune(): Promise<void> {
    this.logger.log('Running automatic memory pruning');

    try {
      // Get all active users
      const users = await this.prisma.user.findMany({
        where: { isActive: true },
        select: { id: true },
      });

      let totalDeleted = 0;

      for (const user of users) {
        const result = await this.memoryService.prune(user.id);
        totalDeleted += result.deleted;
      }

      this.logger.log(`Pruning complete: ${totalDeleted} memories deleted`);
    } catch (error) {
      this.logger.error('Auto pruning failed:', error);
    }
  }

  /**
   * Compress large memory stores (run weekly)
   */
  @Cron(CronExpression.EVERY_WEEK)
  async compressMemories(): Promise<void> {
    this.logger.log('Running memory compression');

    try {
      // Get users with large memory stores
      const users = await this.prisma.user.findMany({
        where: { isActive: true },
        select: {
          id: true,
          _count: {
            select: { memories: true },
          },
        },
      });

      const usersNeedingCompression = users.filter((u) => u._count.memories > 1000);

      for (const user of usersNeedingCompression) {
        await this.compressUserMemories(user.id);
      }

      this.logger.log(
        `Compression complete for ${usersNeedingCompression.length} users`,
      );
    } catch (error) {
      this.logger.error('Memory compression failed:', error);
    }
  }

  /**
   * Compress memories for a specific user
   */
  private async compressUserMemories(userId: string): Promise<void> {
    this.logger.debug(`Compressing memories for user ${userId}`);

    // Get low-score, rarely accessed memories
    const candidates = await this.prisma.memory.findMany({
      where: {
        userId,
        score: { lte: 0.5 },
        accessCount: { lte: 2 },
        createdAt: { lte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { score: 'asc' },
      take: 100,
    });

    if (candidates.length > 0) {
      // Delete the lowest-value memories
      const idsToDelete = candidates.map((m) => m.id);
      await this.prisma.memory.deleteMany({
        where: { id: { in: idsToDelete } },
      });

      this.logger.debug(`Compressed ${idsToDelete.length} memories for user ${userId}`);
    }
  }
}
