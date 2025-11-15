import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PlannerService } from './planner.service';
import { ReflectionService } from './reflection.service';
import { ToolSelectorService } from './tool-selector.service';
import { ExecutionService } from './execution.service';
import { ContextService } from './context.service';
import { MemoryService } from '../memory/memory.service';
import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus, TaskStepStatus, MemoryType } from '../types/prisma-enums';

export interface ReasoningInput {
  userId: string;
  taskId: string;
  goal: string;
  context?: Record<string, any>;
  sessionId?: string;
}

export interface ReasoningResult {
  success: boolean;
  result?: any;
  error?: string;
  steps: StepResult[];
  reflections: string[];
}

export interface StepResult {
  stepNumber: number;
  name: string;
  status: 'completed' | 'failed' | 'skipped';
  output?: any;
  error?: string;
}

@Injectable()
export class ReasoningService {
  private readonly logger = new Logger(ReasoningService.name);
  private readonly openai: OpenAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly plannerService: PlannerService,
    private readonly reflectionService: ReflectionService,
    private readonly toolSelector: ToolSelectorService,
    private readonly executionService: ExecutionService,
    private readonly contextService: ContextService,
    private readonly memoryService: MemoryService,
    private readonly prisma: PrismaService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  /**
   * Main reasoning loop: Plan -> Execute -> Reflect -> Adjust
   */
  async reason(input: ReasoningInput): Promise<ReasoningResult> {
    this.logger.log(`Starting reasoning for task ${input.taskId}`);

    const result: ReasoningResult = {
      success: false,
      steps: [],
      reflections: [],
    };

    try {
      // Update task status to PLANNING
      await this.prisma.task.update({
        where: { id: input.taskId },
        data: { status: TaskStatus.PLANNING },
      });

      // 1. Load context from memory
      const context = await this.contextService.buildContext({
        userId: input.userId,
        goal: input.goal,
        sessionId: input.sessionId,
        additionalContext: input.context,
      });

      // 2. Create execution plan
      this.logger.log('Creating execution plan...');
      const plan = await this.plannerService.createPlan({
        goal: input.goal,
        context,
      });

      // Store plan in task
      await this.prisma.task.update({
        where: { id: input.taskId },
        data: {
          planData: plan as any,
          status: TaskStatus.EXECUTING,
        },
      });

      // 3. Execute plan with reflection loop
      const maxRetries = 3;
      let attempt = 0;
      let currentPlan = plan;

      while (attempt < maxRetries) {
        this.logger.log(`Execution attempt ${attempt + 1}/${maxRetries}`);

        // Execute each step
        for (let i = 0; i < currentPlan.steps.length; i++) {
          const step = currentPlan.steps[i];

          // Create step record
          const stepRecord = await this.prisma.taskStep.create({
            data: {
              taskId: input.taskId,
              stepNumber: i + 1,
              name: step.name,
              description: step.description,
              status: TaskStepStatus.RUNNING,
              input: step.input || {},
            },
          });

          try {
            this.logger.log(`Executing step ${i + 1}: ${step.name}`);

            // Select appropriate tool
            const tool = await this.toolSelector.selectTool({
              step,
              availableTools: step.suggestedTools || [],
              context,
            });

            // Execute tool
            const stepResult = await this.executionService.executeStep({
              step,
              tool,
              context,
              taskId: input.taskId,
            });

            // Update step record
            await this.prisma.taskStep.update({
              where: { id: stepRecord.id },
              data: {
                status: TaskStepStatus.COMPLETED,
                output: stepResult.output || {},
                completedAt: new Date(),
              },
            });

            // Update context with step result
            context.stepResults = context.stepResults || [];
            context.stepResults.push(stepResult);

            result.steps.push({
              stepNumber: i + 1,
              name: step.name,
              status: 'completed',
              output: stepResult.output,
            });

            // Update task progress
            const progress = ((i + 1) / currentPlan.steps.length) * 100;
            await this.prisma.task.update({
              where: { id: input.taskId },
              data: { progress },
            });
          } catch (error) {
            this.logger.error(`Step ${i + 1} failed:`, error);

            // Update step record
            await this.prisma.taskStep.update({
              where: { id: stepRecord.id },
              data: {
                status: TaskStepStatus.FAILED,
                error: error.message,
                completedAt: new Date(),
              },
            });

            result.steps.push({
              stepNumber: i + 1,
              name: step.name,
              status: 'failed',
              error: error.message,
            });

            // Reflect on failure and decide whether to retry
            const reflection = await this.reflectionService.reflect({
              goal: input.goal,
              plan: currentPlan,
              executedSteps: result.steps,
              error: error.message,
              context,
            });

            result.reflections.push(reflection.analysis);

            if (reflection.shouldRetry) {
              this.logger.log('Reflection suggests retry with adjusted plan');
              currentPlan = reflection.adjustedPlan || currentPlan;
              break; // Break step loop to retry
            } else {
              throw error; // Propagate error if no retry
            }
          }
        }

        // Check if all steps completed
        const allCompleted = result.steps.every((s) => s.status === 'completed');
        if (allCompleted) {
          this.logger.log('All steps completed successfully');
          result.success = true;
          break;
        }

        attempt++;
      }

      // Final reflection
      const finalReflection = await this.reflectionService.reflect({
        goal: input.goal,
        plan: currentPlan,
        executedSteps: result.steps,
        context,
      });

      result.reflections.push(finalReflection.analysis);

      // Store result in memory
      await this.memoryService.store({
        userId: input.userId,
        type: MemoryType.EPISODIC,
        content: `Completed task: ${input.goal}. Success: ${result.success}`,
        metadata: {
          taskId: input.taskId,
          goal: input.goal,
          steps: result.steps.length,
          reflections: result.reflections,
        },
      });

      // Update task status
      await this.prisma.task.update({
        where: { id: input.taskId },
        data: {
          status: result.success ? TaskStatus.COMPLETED : TaskStatus.FAILED,
          result: result as any,
          completedAt: new Date(),
          progress: 100,
        },
      });

      return result;
    } catch (error) {
      this.logger.error('Reasoning failed:', error);
      result.success = false;
      result.error = error.message;

      // Update task status
      await this.prisma.task.update({
        where: { id: input.taskId },
        data: {
          status: TaskStatus.FAILED,
          error: error.message,
        },
      });

      return result;
    }
  }

  /**
   * Pause task execution
   */
  async pauseTask(taskId: string): Promise<void> {
    await this.prisma.task.update({
      where: { id: taskId },
      data: { status: TaskStatus.PAUSED },
    });
  }

  /**
   * Resume task execution
   */
  async resumeTask(taskId: string): Promise<ReasoningResult> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { user: true },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    return this.reason({
      userId: task.userId,
      taskId: task.id,
      goal: task.title,
      sessionId: task.sessionId,
    });
  }

  /**
   * Cancel task execution
   */
  async cancelTask(taskId: string): Promise<void> {
    await this.prisma.task.update({
      where: { id: taskId },
      data: { status: TaskStatus.CANCELLED },
    });
  }
}
