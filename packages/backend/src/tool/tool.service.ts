import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ToolRegistryService } from './tool-registry.service';
import { ToolExecutorService } from './tool-executor.service';
import { ToolLoaderService } from './tool-loader.service';

export interface ToolDefinition {
  name: string;
  version: string;
  description: string;
  schema: {
    input: any;
    output: any;
  };
  requiresAuth?: boolean;
  timeout?: number;
  maxRetries?: number;
  execute: (input: any, context?: any) => Promise<any>;
}

@Injectable()
export class ToolService implements OnModuleInit {
  private readonly logger = new Logger(ToolService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly registry: ToolRegistryService,
    private readonly executor: ToolExecutorService,
    private readonly loader: ToolLoaderService,
  ) {}

  async onModuleInit() {
    await this.initializeTools();
  }

  /**
   * Initialize all tools (built-in and custom)
   */
  private async initializeTools(): Promise<void> {
    this.logger.log('Initializing tools...');

    try {
      // Load built-in tools
      await this.loader.loadBuiltInTools();

      // Load custom tools from database
      await this.loader.loadCustomTools();

      const toolCount = this.registry.getToolCount();
      this.logger.log(`${toolCount} tools initialized successfully`);
    } catch (error) {
      this.logger.error('Failed to initialize tools:', error);
    }
  }

  /**
   * Register a new tool
   */
  async registerTool(tool: ToolDefinition): Promise<any> {
    this.logger.log(`Registering tool: ${tool.name}`);

    // Register in memory
    this.registry.register(tool);

    // Store in database
    const dbTool = await this.prisma.tool.upsert({
      where: { name: tool.name },
      update: {
        version: tool.version,
        description: tool.description,
        schema: tool.schema as any,
        requiresAuth: tool.requiresAuth || false,
        timeout: tool.timeout || 30000,
        maxRetries: tool.maxRetries || 3,
      },
      create: {
        name: tool.name,
        version: tool.version,
        description: tool.description,
        schema: tool.schema as any,
        requiresAuth: tool.requiresAuth || false,
        timeout: tool.timeout || 30000,
        maxRetries: tool.maxRetries || 3,
      },
    });

    return dbTool;
  }

  /**
   * Execute a tool
   */
  async executeTool(
    toolName: string,
    input: any,
    taskId?: string,
    context?: any,
  ): Promise<any> {
    this.logger.log(`Executing tool: ${toolName}`);

    // Get tool from registry
    const tool = this.registry.get(toolName);
    if (!tool) {
      throw new Error(`Tool not found: ${toolName}`);
    }

    // Get tool config from database
    const dbTool = await this.prisma.tool.findUnique({
      where: { name: toolName },
    });

    if (!dbTool || !dbTool.isEnabled) {
      throw new Error(`Tool ${toolName} is not enabled`);
    }

    // Create execution record
    const execution = await this.prisma.toolExecution.create({
      data: {
        toolId: dbTool.id,
        taskId,
        input: input as any,
        status: 'RUNNING',
      },
    });

    try {
      // Execute tool
      const result = await this.executor.execute({
        tool,
        input,
        context,
        timeout: dbTool.timeout,
        maxRetries: dbTool.maxRetries,
      });

      // Update execution record
      await this.prisma.toolExecution.update({
        where: { id: execution.id },
        data: {
          status: 'COMPLETED',
          output: result as any,
          completedAt: new Date(),
          duration: Date.now() - execution.startedAt.getTime(),
        },
      });

      return result;
    } catch (error) {
      this.logger.error(`Tool execution failed: ${error.message}`);

      // Update execution record
      await this.prisma.toolExecution.update({
        where: { id: execution.id },
        data: {
          status: 'FAILED',
          error: error.message,
          completedAt: new Date(),
          duration: Date.now() - execution.startedAt.getTime(),
        },
      });

      throw error;
    }
  }

  /**
   * Get all tools
   */
  async getAllTools(): Promise<any[]> {
    return this.prisma.tool.findMany({
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get tool by name
   */
  async getTool(name: string): Promise<any> {
    return this.prisma.tool.findUnique({
      where: { name },
    });
  }

  /**
   * Enable/disable tool
   */
  async setToolStatus(name: string, isEnabled: boolean): Promise<any> {
    return this.prisma.tool.update({
      where: { name },
      data: { isEnabled },
    });
  }

  /**
   * Get tool execution history
   */
  async getExecutionHistory(params: {
    toolName?: string;
    taskId?: string;
    limit?: number;
  }): Promise<any[]> {
    const where: any = {};

    if (params.toolName) {
      const tool = await this.prisma.tool.findUnique({
        where: { name: params.toolName },
      });
      if (tool) {
        where.toolId = tool.id;
      }
    }

    if (params.taskId) {
      where.taskId = params.taskId;
    }

    return this.prisma.toolExecution.findMany({
      where,
      take: params.limit || 50,
      orderBy: { startedAt: 'desc' },
      include: {
        tool: true,
      },
    });
  }

  /**
   * Get tool statistics
   */
  async getToolStats(toolName?: string): Promise<any> {
    const where: any = {};

    if (toolName) {
      const tool = await this.prisma.tool.findUnique({
        where: { name: toolName },
      });
      if (tool) {
        where.toolId = tool.id;
      }
    }

    const executions = await this.prisma.toolExecution.findMany({
      where,
      select: {
        status: true,
        duration: true,
        tool: { select: { name: true } },
      },
    });

    const stats: any = {
      total: executions.length,
      successful: 0,
      failed: 0,
      averageDuration: 0,
      byTool: {},
    };

    let totalDuration = 0;

    for (const execution of executions) {
      if (execution.status === 'COMPLETED') {
        stats.successful++;
      } else if (execution.status === 'FAILED') {
        stats.failed++;
      }

      if (execution.duration) {
        totalDuration += execution.duration;
      }

      const toolName = execution.tool.name;
      if (!stats.byTool[toolName]) {
        stats.byTool[toolName] = { total: 0, successful: 0, failed: 0 };
      }
      stats.byTool[toolName].total++;
      if (execution.status === 'COMPLETED') {
        stats.byTool[toolName].successful++;
      } else if (execution.status === 'FAILED') {
        stats.byTool[toolName].failed++;
      }
    }

    stats.averageDuration = executions.length > 0 ? totalDuration / executions.length : 0;

    return stats;
  }

  /**
   * Reload tools (for hot reload in development)
   */
  async reloadTools(): Promise<void> {
    this.logger.log('Reloading tools...');
    await this.initializeTools();
  }
}
