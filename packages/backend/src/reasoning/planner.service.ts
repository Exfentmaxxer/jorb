import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface PlanInput {
  goal: string;
  context: Record<string, any>;
}

export interface ExecutionPlan {
  goal: string;
  steps: PlanStep[];
  estimatedDuration?: number;
  dependencies?: string[];
}

export interface PlanStep {
  name: string;
  description: string;
  input?: Record<string, any>;
  expectedOutput?: string;
  suggestedTools?: string[];
  dependencies?: number[]; // Indices of dependent steps
  fallbackStrategy?: string;
}

@Injectable()
export class PlannerService {
  private readonly logger = new Logger(PlannerService.name);
  private readonly openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  /**
   * Create a multi-step execution plan for a given goal
   */
  async createPlan(input: PlanInput): Promise<ExecutionPlan> {
    this.logger.log(`Creating plan for goal: ${input.goal}`);

    const systemPrompt = `You are an expert task planner for an agentic AI system.
Your job is to decompose complex goals into clear, executable steps.

Available tools: calculator, scheduler, email_drafter, http_request, browser_automation, file_io

Guidelines:
1. Break down the goal into 3-10 concrete steps
2. Each step should be atomic and executable
3. Identify dependencies between steps
4. Suggest appropriate tools for each step
5. Include fallback strategies for critical steps
6. Be specific about inputs and expected outputs

Return a JSON object with this structure:
{
  "goal": "the original goal",
  "steps": [
    {
      "name": "step name",
      "description": "detailed description",
      "input": {},
      "expectedOutput": "what this step should produce",
      "suggestedTools": ["tool1", "tool2"],
      "dependencies": [0, 1],
      "fallbackStrategy": "what to do if this fails"
    }
  ],
  "estimatedDuration": 300
}`;

    const userPrompt = `Goal: ${input.goal}

Context:
${JSON.stringify(input.context, null, 2)}

Create a detailed execution plan.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.configService.get<string>('OPENAI_MODEL', 'gpt-4-turbo-preview'),
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const plan = JSON.parse(response.choices[0].message.content) as ExecutionPlan;

      this.logger.log(`Created plan with ${plan.steps.length} steps`);
      return plan;
    } catch (error) {
      this.logger.error('Failed to create plan:', error);

      // Fallback: create a simple single-step plan
      return {
        goal: input.goal,
        steps: [
          {
            name: 'Execute goal directly',
            description: input.goal,
            suggestedTools: ['http_request'],
            fallbackStrategy: 'Report error to user',
          },
        ],
        estimatedDuration: 60,
      };
    }
  }

  /**
   * Validate a plan for logical consistency
   */
  validatePlan(plan: ExecutionPlan): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for empty steps
    if (!plan.steps || plan.steps.length === 0) {
      errors.push('Plan must have at least one step');
    }

    // Check for circular dependencies
    for (let i = 0; i < plan.steps.length; i++) {
      const step = plan.steps[i];
      if (step.dependencies) {
        for (const depIndex of step.dependencies) {
          if (depIndex >= i) {
            errors.push(`Step ${i} has forward or circular dependency on step ${depIndex}`);
          }
        }
      }
    }

    // Check for invalid dependencies
    for (let i = 0; i < plan.steps.length; i++) {
      const step = plan.steps[i];
      if (step.dependencies) {
        for (const depIndex of step.dependencies) {
          if (depIndex < 0 || depIndex >= plan.steps.length) {
            errors.push(`Step ${i} has invalid dependency index: ${depIndex}`);
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Adjust plan based on execution results
   */
  async adjustPlan(params: {
    originalPlan: ExecutionPlan;
    executedSteps: number;
    error?: string;
    context: Record<string, any>;
  }): Promise<ExecutionPlan> {
    this.logger.log(`Adjusting plan after step ${params.executedSteps}`);

    const systemPrompt = `You are an expert at adapting execution plans when things go wrong.
Analyze the execution so far and create an adjusted plan that handles the error.

You can:
1. Modify remaining steps
2. Add new recovery steps
3. Change the approach entirely
4. Skip non-essential steps

Return the adjusted plan in the same JSON format as the original plan.`;

    const userPrompt = `Original goal: ${params.originalPlan.goal}

Original plan:
${JSON.stringify(params.originalPlan, null, 2)}

Executed ${params.executedSteps} steps.
${params.error ? `Error encountered: ${params.error}` : 'Execution in progress'}

Context:
${JSON.stringify(params.context, null, 2)}

Create an adjusted plan to handle this situation.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.configService.get<string>('OPENAI_MODEL', 'gpt-4-turbo-preview'),
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const adjustedPlan = JSON.parse(response.choices[0].message.content) as ExecutionPlan;

      this.logger.log(`Adjusted plan has ${adjustedPlan.steps.length} steps`);
      return adjustedPlan;
    } catch (error) {
      this.logger.error('Failed to adjust plan:', error);
      return params.originalPlan; // Return original plan as fallback
    }
  }
}
