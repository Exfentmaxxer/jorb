import { Injectable, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { ToolRegistryService } from './tool-registry.service';
import { ToolDefinition } from './tool.service';

// Built-in tool imports
import { CalculatorTool } from './built-in/calculator.tool';
import { SchedulerTool } from './built-in/scheduler.tool';
import { EmailDrafterTool } from './built-in/email-drafter.tool';
import { HttpRequestTool } from './built-in/http-request.tool';
import { BrowserAutomationTool } from './built-in/browser-automation.tool';
import { FileIoTool } from './built-in/file-io.tool';

@Injectable()
export class ToolLoaderService {
  private readonly logger = new Logger(ToolLoaderService.name);

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly prisma: PrismaService,
    private readonly registry: ToolRegistryService,
  ) {}

  /**
   * Load all built-in tools
   */
  async loadBuiltInTools(): Promise<void> {
    this.logger.log('Loading built-in tools...');

    const builtInTools = [
      CalculatorTool,
      SchedulerTool,
      EmailDrafterTool,
      HttpRequestTool,
      BrowserAutomationTool,
      FileIoTool,
    ];

    for (const ToolClass of builtInTools) {
      try {
        const toolInstance = this.moduleRef.get(ToolClass, { strict: false });
        const toolDef = toolInstance.getDefinition();

        // Register in memory
        this.registry.register(toolDef);

        // Store/update in database
        await this.prisma.tool.upsert({
          where: { name: toolDef.name },
          update: {
            version: toolDef.version,
            description: toolDef.description,
            schema: toolDef.schema as any,
            requiresAuth: toolDef.requiresAuth || false,
            timeout: toolDef.timeout || 30000,
            maxRetries: toolDef.maxRetries || 3,
          },
          create: {
            name: toolDef.name,
            version: toolDef.version,
            description: toolDef.description,
            schema: toolDef.schema as any,
            requiresAuth: toolDef.requiresAuth || false,
            timeout: toolDef.timeout || 30000,
            maxRetries: toolDef.maxRetries || 3,
            isEnabled: true,
          },
        });

        this.logger.debug(`Loaded built-in tool: ${toolDef.name}`);
      } catch (error) {
        this.logger.error(`Failed to load built-in tool ${ToolClass.name}:`, error);
      }
    }

    this.logger.log(`Loaded ${builtInTools.length} built-in tools`);
  }

  /**
   * Load custom tools from database
   */
  async loadCustomTools(): Promise<void> {
    this.logger.log('Loading custom tools from database...');

    const tools = await this.prisma.tool.findMany({
      where: { isEnabled: true },
    });

    // Filter out tools that are already loaded (built-in tools)
    const customTools = tools.filter((t) => !this.registry.has(t.name));

    this.logger.log(`Found ${customTools.length} custom tools in database`);

    // Custom tools would need a different loading mechanism
    // For now, we'll just log them
    for (const tool of customTools) {
      this.logger.debug(`Custom tool found: ${tool.name} (requires implementation)`);
    }
  }

  /**
   * Load a tool from a JSON definition
   */
  async loadFromJson(jsonDef: any): Promise<void> {
    this.logger.log(`Loading tool from JSON: ${jsonDef.name}`);

    // Create a tool definition from JSON
    const toolDef: ToolDefinition = {
      name: jsonDef.name,
      version: jsonDef.version || '1.0.0',
      description: jsonDef.description || '',
      schema: jsonDef.schema || {},
      requiresAuth: jsonDef.requiresAuth || false,
      timeout: jsonDef.timeout || 30000,
      maxRetries: jsonDef.maxRetries || 3,
      execute: async (input: any, context?: any) => {
        // For JSON-defined tools, we'd need to implement execution logic
        // This could be JavaScript code, HTTP endpoint call, etc.
        throw new Error('JSON-defined tool execution not implemented');
      },
    };

    this.registry.register(toolDef);

    // Store in database
    await this.prisma.tool.upsert({
      where: { name: toolDef.name },
      update: {
        version: toolDef.version,
        description: toolDef.description,
        schema: toolDef.schema as any,
        requiresAuth: toolDef.requiresAuth,
        timeout: toolDef.timeout,
        maxRetries: toolDef.maxRetries,
      },
      create: {
        name: toolDef.name,
        version: toolDef.version,
        description: toolDef.description,
        schema: toolDef.schema as any,
        requiresAuth: toolDef.requiresAuth,
        timeout: toolDef.timeout,
        maxRetries: toolDef.maxRetries,
        isEnabled: true,
      },
    });
  }
}
