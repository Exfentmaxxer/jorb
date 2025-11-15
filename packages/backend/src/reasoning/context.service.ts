import { Injectable, Logger } from '@nestjs/common';
import { MemoryService } from '../memory/memory.service';
import { PrismaService } from '../prisma/prisma.service';

export interface ContextBuildInput {
  userId: string;
  goal: string;
  sessionId?: string;
  additionalContext?: Record<string, any>;
}

export interface ExecutionContext {
  userId: string;
  goal: string;
  sessionId?: string;
  sessionHistory: any[];
  relevantMemories: any[];
  userProfile: any;
  environmentInfo: Record<string, any>;
  stepResults?: any[];
  timestamp: Date;
}

@Injectable()
export class ContextService {
  private readonly logger = new Logger(ContextService.name);

  constructor(
    private readonly memoryService: MemoryService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Build comprehensive context for task execution
   */
  async buildContext(input: ContextBuildInput): Promise<ExecutionContext> {
    this.logger.log(`Building context for user ${input.userId}`);

    // Get user information
    const user = await this.prisma.user.findUnique({
      where: { id: input.userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get session history if sessionId provided
    let sessionHistory: any[] = [];
    if (input.sessionId) {
      const session = await this.prisma.session.findUnique({
        where: { id: input.sessionId },
        include: {
          tasks: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      if (session) {
        sessionHistory = session.tasks;
      }
    }

    // Retrieve relevant memories using semantic search
    const relevantMemories = await this.memoryService.search({
      userId: input.userId,
      query: input.goal,
      limit: 10,
      types: ['SEMANTIC', 'EPISODIC', 'PROCEDURAL'],
    });

    // Build environment information
    const environmentInfo = {
      currentDate: new Date().toISOString(),
      serverTime: Date.now(),
      ...input.additionalContext,
    };

    const context: ExecutionContext = {
      userId: input.userId,
      goal: input.goal,
      sessionId: input.sessionId,
      sessionHistory,
      relevantMemories,
      userProfile: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      environmentInfo,
      timestamp: new Date(),
    };

    this.logger.debug(
      `Context built with ${sessionHistory.length} session tasks and ${relevantMemories.length} memories`,
    );

    return context;
  }

  /**
   * Update context with new information
   */
  async updateContext(
    context: ExecutionContext,
    updates: Partial<ExecutionContext>,
  ): Promise<ExecutionContext> {
    this.logger.debug('Updating context');

    const updated = {
      ...context,
      ...updates,
      timestamp: new Date(),
    };

    return updated;
  }

  /**
   * Save context snapshot to session
   */
  async saveContextSnapshot(sessionId: string, context: ExecutionContext): Promise<void> {
    this.logger.log(`Saving context snapshot for session ${sessionId}`);

    await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        contextData: context as any,
      },
    });
  }

  /**
   * Restore context from session
   */
  async restoreContext(sessionId: string): Promise<ExecutionContext | null> {
    this.logger.log(`Restoring context for session ${sessionId}`);

    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        user: true,
        tasks: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!session) {
      return null;
    }

    // If contextData exists, use it; otherwise rebuild
    if (session.contextData && typeof session.contextData === 'object') {
      return session.contextData as ExecutionContext;
    }

    // Rebuild context
    return this.buildContext({
      userId: session.userId,
      goal: 'Restored session',
      sessionId: session.id,
    });
  }

  /**
   * Merge multiple contexts (useful for parallel execution)
   */
  mergeContexts(contexts: ExecutionContext[]): ExecutionContext {
    this.logger.debug(`Merging ${contexts.length} contexts`);

    if (contexts.length === 0) {
      throw new Error('Cannot merge empty context array');
    }

    if (contexts.length === 1) {
      return contexts[0];
    }

    const base = contexts[0];
    const merged: ExecutionContext = {
      ...base,
      sessionHistory: [],
      relevantMemories: [],
      stepResults: [],
    };

    // Merge session history (deduplicate)
    const historyMap = new Map<string, any>();
    for (const context of contexts) {
      for (const task of context.sessionHistory) {
        if (!historyMap.has(task.id)) {
          historyMap.set(task.id, task);
        }
      }
    }
    merged.sessionHistory = Array.from(historyMap.values());

    // Merge memories (deduplicate)
    const memoryMap = new Map<string, any>();
    for (const context of contexts) {
      for (const memory of context.relevantMemories) {
        if (!memoryMap.has(memory.id)) {
          memoryMap.set(memory.id, memory);
        }
      }
    }
    merged.relevantMemories = Array.from(memoryMap.values());

    // Merge step results
    for (const context of contexts) {
      if (context.stepResults) {
        merged.stepResults.push(...context.stepResults);
      }
    }

    merged.timestamp = new Date();

    return merged;
  }

  /**
   * Compress context to reduce size (remove old/irrelevant data)
   */
  compressContext(
    context: ExecutionContext,
    options: {
      maxHistoryItems?: number;
      maxMemories?: number;
      maxStepResults?: number;
    } = {},
  ): ExecutionContext {
    this.logger.debug('Compressing context');

    const maxHistoryItems = options.maxHistoryItems || 5;
    const maxMemories = options.maxMemories || 10;
    const maxStepResults = options.maxStepResults || 20;

    const compressed: ExecutionContext = {
      ...context,
      sessionHistory: context.sessionHistory.slice(0, maxHistoryItems),
      relevantMemories: context.relevantMemories.slice(0, maxMemories),
      stepResults: context.stepResults?.slice(-maxStepResults),
      timestamp: new Date(),
    };

    return compressed;
  }
}
