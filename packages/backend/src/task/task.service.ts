import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReasoningService } from '../reasoning/reasoning.service';
import { TaskStatus } from '../types/prisma-enums';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly reasoningService: ReasoningService,
  ) {}

  async create(data: {
    userId: string;
    title: string;
    description?: string;
    priority?: number;
    sessionId?: string;
  }) {
    const task = await this.prisma.task.create({
      data: {
        userId: data.userId,
        title: data.title,
        description: data.description,
        priority: data.priority || 0,
        sessionId: data.sessionId,
      },
    });

    // Start reasoning asynchronously
    this.reasoningService
      .reason({
        userId: data.userId,
        taskId: task.id,
        goal: data.title,
        sessionId: data.sessionId,
      })
      .catch((error) => {
        this.logger.error(`Task ${task.id} reasoning failed:`, error);
      });

    return task;
  }

  async findAll(userId: string, params?: { status?: TaskStatus; limit?: number }) {
    return this.prisma.task.findMany({
      where: {
        userId,
        ...(params?.status && { status: params.status }),
      },
      take: params?.limit || 50,
      orderBy: { createdAt: 'desc' },
      include: {
        steps: true,
      },
    });
  }

  async findOne(userId: string, taskId: string) {
    return this.prisma.task.findFirst({
      where: { id: taskId, userId },
      include: {
        steps: { orderBy: { stepNumber: 'asc' } },
        toolExecutions: { include: { tool: true } },
      },
    });
  }

  async pause(userId: string, taskId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    await this.reasoningService.pauseTask(taskId);
    return { success: true, message: 'Task paused' };
  }

  async resume(userId: string, taskId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    this.reasoningService.resumeTask(taskId).catch((error) => {
      this.logger.error(`Task ${taskId} resume failed:`, error);
    });

    return { success: true, message: 'Task resumed' };
  }

  async cancel(userId: string, taskId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    await this.reasoningService.cancelTask(taskId);
    return { success: true, message: 'Task cancelled' };
  }

  async getStats(userId: string) {
    const tasks = await this.prisma.task.findMany({
      where: { userId },
      select: { status: true },
    });

    const stats = {
      total: tasks.length,
      pending: 0,
      executing: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
    };

    for (const task of tasks) {
      if (task.status === TaskStatus.PENDING || task.status === TaskStatus.PLANNING) {
        stats.pending++;
      } else if (task.status === TaskStatus.EXECUTING || task.status === TaskStatus.PAUSED) {
        stats.executing++;
      } else if (task.status === TaskStatus.COMPLETED) {
        stats.completed++;
      } else if (task.status === TaskStatus.FAILED) {
        stats.failed++;
      } else if (task.status === TaskStatus.CANCELLED) {
        stats.cancelled++;
      }
    }

    return stats;
  }
}
