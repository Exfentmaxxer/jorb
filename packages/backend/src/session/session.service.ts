import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SessionStatus } from '../types/prisma-enums';

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, contextData?: Record<string, any>) {
    return this.prisma.session.create({
      data: { userId, contextData: contextData || {} },
    });
  }

  async findAll(userId: string) {
    return this.prisma.session.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      include: { tasks: true },
    });
  }

  async findOne(userId: string, sessionId: string) {
    return this.prisma.session.findFirst({
      where: { id: sessionId, userId },
      include: { tasks: { orderBy: { createdAt: 'desc' } } },
    });
  }

  async terminate(userId: string, sessionId: string) {
    return this.prisma.session.update({
      where: { id: sessionId },
      data: { status: SessionStatus.TERMINATED, endedAt: new Date() },
    });
  }
}
