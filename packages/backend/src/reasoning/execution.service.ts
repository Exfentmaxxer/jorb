import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PlanStep } from './planner.service';
import { ToolService } from '../tool/tool.service';
import { ToolSelectionResult } from './tool-selector.service';
import CircuitBreaker from 'opossum';

export interface StepExecutionInput {
  step: PlanStep;
  tool: ToolSelectionResult;
  context: Record<string, any>;
  taskId: string;
}

export interface StepExecutionResult {
  success: boolean;
  output?: any;
  error?: string;
  executionTime: number;
  toolUsed: string;
  attempts: number;
}

@Injectable()
export class ExecutionService {
  private readonly logger = new Logger(ExecutionService.name);
  private readonly circuitBreakers: Map<string, CircuitBreaker> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly toolService: ToolService,
  ) {}

  /**
   * Execute a plan step with the selected tool
   */
  async executeStep(input: StepExecutionInput): Promise<StepExecutionResult> {
    this.logger.log(`Executing step: ${input.step.name} with tool: ${input.tool.toolName}`);

    const maxRetries = this.configService.get<number>('TOOL_MAX_RETRIES', 3);
    const timeout = this.configService.get<number>('TOOL_TIMEOUT_MS', 30000);

    const startTime = Date.now();
    let attempts = 0;
    let lastError: Error | null = null;

    // Get or create circuit breaker for this tool
    const breaker = this.getCircuitBreaker(input.tool.toolName, timeout);

    // Try with primary tool
    while (attempts < maxRetries) {
      attempts++;

      try {
        this.logger.debug(`Attempt ${attempts}/${maxRetries}`);

        // Execute tool through circuit breaker
        const output = await breaker.fire({
          toolName: input.tool.toolName,
          input: input.step.input || {},
          context: input.context,
          taskId: input.taskId,
        });

        const executionTime = Date.now() - startTime;

        this.logger.log(
          `Step executed successfully in ${executionTime}ms after ${attempts} attempt(s)`,
        );

        return {
          success: true,
          output,
          executionTime,
          toolUsed: input.tool.toolName,
          attempts,
        };
      } catch (error) {
        lastError = error;
        this.logger.warn(`Attempt ${attempts} failed: ${error.message}`);

        // Exponential backoff before retry
        if (attempts < maxRetries) {
          const backoffMs = Math.min(1000 * Math.pow(2, attempts - 1), 10000);
          this.logger.debug(`Backing off for ${backoffMs}ms before retry`);
          await this.sleep(backoffMs);
        }
      }
    }

    // If primary tool failed, try fallback tools
    if (input.tool.fallbackTools && input.tool.fallbackTools.length > 0) {
      this.logger.warn(
        `Primary tool ${input.tool.toolName} failed, trying fallback tools`,
      );

      for (const fallbackTool of input.tool.fallbackTools) {
        try {
          this.logger.log(`Trying fallback tool: ${fallbackTool}`);
          const fallbackBreaker = this.getCircuitBreaker(fallbackTool, timeout);

          const output = await fallbackBreaker.fire({
            toolName: fallbackTool,
            input: input.step.input || {},
            context: input.context,
            taskId: input.taskId,
          });

          const executionTime = Date.now() - startTime;

          this.logger.log(`Fallback tool ${fallbackTool} succeeded`);

          return {
            success: true,
            output,
            executionTime,
            toolUsed: fallbackTool,
            attempts: attempts + 1,
          };
        } catch (error) {
          this.logger.warn(`Fallback tool ${fallbackTool} failed: ${error.message}`);
          lastError = error;
        }
      }
    }

    // All attempts failed
    const executionTime = Date.now() - startTime;

    this.logger.error(
      `Step execution failed after ${attempts} attempts and ${input.tool.fallbackTools?.length || 0} fallback(s)`,
    );

    return {
      success: false,
      error: lastError?.message || 'Unknown error',
      executionTime,
      toolUsed: input.tool.toolName,
      attempts,
    };
  }

  /**
   * Execute multiple steps in parallel
   */
  async executeParallel(
    steps: StepExecutionInput[],
  ): Promise<StepExecutionResult[]> {
    this.logger.log(`Executing ${steps.length} steps in parallel`);

    const promises = steps.map((step) => this.executeStep(step));
    const results = await Promise.allSettled(promises);

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          success: false,
          error: result.reason?.message || 'Unknown error',
          executionTime: 0,
          toolUsed: steps[index].tool.toolName,
          attempts: 1,
        };
      }
    });
  }

  /**
   * Get or create circuit breaker for a tool
   */
  private getCircuitBreaker(toolName: string, timeout: number): CircuitBreaker {
    if (!this.circuitBreakers.has(toolName)) {
      const breaker = new CircuitBreaker(
        async (params: {
          toolName: string;
          input: any;
          context: any;
          taskId: string;
        }) => {
          return await this.toolService.executeTool(
            params.toolName,
            params.input,
            params.taskId,
          );
        },
        {
          timeout,
          errorThresholdPercentage: 50,
          resetTimeout: 30000, // 30 seconds
          name: toolName,
        },
      );

      // Event handlers
      breaker.on('open', () => {
        this.logger.warn(`Circuit breaker OPEN for tool: ${toolName}`);
      });

      breaker.on('halfOpen', () => {
        this.logger.log(`Circuit breaker HALF-OPEN for tool: ${toolName}`);
      });

      breaker.on('close', () => {
        this.logger.log(`Circuit breaker CLOSED for tool: ${toolName}`);
      });

      this.circuitBreakers.set(toolName, breaker);
    }

    return this.circuitBreakers.get(toolName)!;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get execution statistics for monitoring
   */
  getExecutionStats(): {
    toolName: string;
    stats: any;
  }[] {
    const stats: { toolName: string; stats: any }[] = [];

    for (const [toolName, breaker] of this.circuitBreakers) {
      stats.push({
        toolName,
        stats: breaker.stats,
      });
    }

    return stats;
  }
}
