import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ToolDefinition } from './tool.service';

export interface ToolExecutionInput {
  tool: ToolDefinition;
  input: any;
  context?: any;
  timeout?: number;
  maxRetries?: number;
}

@Injectable()
export class ToolExecutorService {
  private readonly logger = new Logger(ToolExecutorService.name);
  private readonly sandboxEnabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.sandboxEnabled = this.configService.get<boolean>('TOOL_SANDBOX_ENABLED', true);
  }

  /**
   * Execute a tool with timeout and retry logic
   */
  async execute(input: ToolExecutionInput): Promise<any> {
    const timeout = input.timeout || this.configService.get<number>('TOOL_TIMEOUT_MS', 30000);
    const maxRetries = input.maxRetries || this.configService.get<number>('TOOL_MAX_RETRIES', 3);

    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt < maxRetries) {
      attempt++;

      try {
        this.logger.debug(
          `Executing ${input.tool.name} (attempt ${attempt}/${maxRetries})`,
        );

        // Validate input against schema
        this.validateInput(input.tool, input.input);

        // Execute with timeout
        const result = await this.executeWithTimeout(
          async () => {
            if (this.sandboxEnabled) {
              return await this.executeSandboxed(input.tool, input.input, input.context);
            } else {
              return await input.tool.execute(input.input, input.context);
            }
          },
          timeout,
        );

        // Validate output against schema
        this.validateOutput(input.tool, result);

        return result;
      } catch (error) {
        lastError = error;
        this.logger.warn(
          `Tool execution attempt ${attempt} failed: ${error.message}`,
        );

        // Don't retry on validation errors
        if (error.message.includes('validation') || error.message.includes('Invalid')) {
          throw error;
        }

        // Exponential backoff before retry
        if (attempt < maxRetries) {
          const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          this.logger.debug(`Backing off for ${backoffMs}ms before retry`);
          await this.sleep(backoffMs);
        }
      }
    }

    throw new Error(
      `Tool execution failed after ${maxRetries} attempts: ${lastError?.message}`,
    );
  }

  /**
   * Execute tool in a sandboxed environment
   */
  private async executeSandboxed(
    tool: ToolDefinition,
    input: any,
    context?: any,
  ): Promise<any> {
    try {
      // In a real implementation, this would use:
      // - VM2 or isolated-vm for JavaScript code
      // - Docker containers for untrusted code
      // - Resource limits (CPU, memory, network)
      // - Permission system for file/network access

      // For now, we'll just execute directly with some safety checks
      const result = await tool.execute(input, context);
      return result;
    } catch (error) {
      this.logger.error(`Sandboxed execution failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute function with timeout
   */
  private async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number,
  ): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Execution timeout (${timeoutMs}ms)`)), timeoutMs),
      ),
    ]);
  }

  /**
   * Validate tool input against schema
   */
  private validateInput(tool: ToolDefinition, input: any): void {
    // Basic validation - in production, use a library like joi or zod
    if (!tool.schema.input) {
      return; // No schema to validate against
    }

    // Check required fields
    if (tool.schema.input.required) {
      for (const field of tool.schema.input.required) {
        if (!(field in input)) {
          throw new Error(`Input validation failed: missing required field "${field}"`);
        }
      }
    }

    // Check types
    if (tool.schema.input.properties) {
      for (const [key, schema] of Object.entries(tool.schema.input.properties as any)) {
        if (key in input) {
          const value = input[key];
          const expectedType = (schema as any).type;

          if (expectedType && typeof value !== expectedType) {
            throw new Error(
              `Input validation failed: field "${key}" should be ${expectedType}, got ${typeof value}`,
            );
          }
        }
      }
    }
  }

  /**
   * Validate tool output against schema
   */
  private validateOutput(tool: ToolDefinition, output: any): void {
    // Basic validation - in production, use a library like joi or zod
    if (!tool.schema.output) {
      return; // No schema to validate against
    }

    // Check output type
    if (tool.schema.output.type) {
      const expectedType = tool.schema.output.type;
      const actualType = typeof output;

      if (actualType !== expectedType && expectedType !== 'object') {
        throw new Error(
          `Output validation failed: expected ${expectedType}, got ${actualType}`,
        );
      }
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Kill a running tool execution (for cancellation)
   */
  async kill(executionId: string): Promise<void> {
    this.logger.warn(`Killing tool execution: ${executionId}`);
    // In a real implementation, this would terminate the sandbox/process
  }
}
