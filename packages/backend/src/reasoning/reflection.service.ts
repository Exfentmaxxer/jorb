import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ExecutionPlan } from './planner.service';
import { StepResult } from './reasoning.service';

export interface ReflectionInput {
  goal: string;
  plan: ExecutionPlan;
  executedSteps: StepResult[];
  error?: string;
  context: Record<string, any>;
}

export interface ReflectionResult {
  analysis: string;
  shouldRetry: boolean;
  adjustedPlan?: ExecutionPlan;
  learnings: string[];
  confidenceScore: number;
}

@Injectable()
export class ReflectionService {
  private readonly logger = new Logger(ReflectionService.name);
  private readonly openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  /**
   * Reflect on execution results and determine next steps
   */
  async reflect(input: ReflectionInput): Promise<ReflectionResult> {
    this.logger.log(`Reflecting on execution: ${input.executedSteps.length} steps completed`);

    const systemPrompt = `You are a reflective AI that analyzes task execution and learns from outcomes.

Your job is to:
1. Analyze what worked and what didn't
2. Identify root causes of failures
3. Extract learnings for future tasks
4. Decide if retry is warranted and how to adjust the approach
5. Assess confidence in the overall execution

Be honest and critical in your analysis.

Return a JSON object with this structure:
{
  "analysis": "detailed analysis of the execution",
  "shouldRetry": true/false,
  "adjustedPlan": { plan object if retry is warranted },
  "learnings": ["learning 1", "learning 2"],
  "confidenceScore": 0.85
}`;

    const userPrompt = `Goal: ${input.goal}

Original Plan:
${JSON.stringify(input.plan, null, 2)}

Executed Steps:
${JSON.stringify(input.executedSteps, null, 2)}

${input.error ? `Error: ${input.error}` : 'Execution completed'}

Context:
${JSON.stringify(input.context, null, 2)}

Analyze this execution and provide reflections.`;

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

      const reflection = JSON.parse(response.choices[0].message.content) as ReflectionResult;

      this.logger.log(
        `Reflection complete. Retry: ${reflection.shouldRetry}, Confidence: ${reflection.confidenceScore}`,
      );

      return reflection;
    } catch (error) {
      this.logger.error('Failed to reflect:', error);

      // Fallback reflection
      return {
        analysis: `Execution analysis failed. ${input.error ? `Error: ${input.error}` : 'Status unknown'}`,
        shouldRetry: false,
        learnings: ['Reflection system encountered an error'],
        confidenceScore: 0.5,
      };
    }
  }

  /**
   * Compare multiple execution attempts and extract patterns
   */
  async compareAttempts(attempts: {
    goal: string;
    executions: Array<{
      plan: ExecutionPlan;
      steps: StepResult[];
      success: boolean;
    }>;
  }): Promise<{
    patterns: string[];
    recommendations: string[];
  }> {
    this.logger.log(`Comparing ${attempts.executions.length} execution attempts`);

    const systemPrompt = `You are analyzing multiple attempts at the same goal.
Identify patterns, common failure points, and provide recommendations.

Return JSON:
{
  "patterns": ["pattern 1", "pattern 2"],
  "recommendations": ["recommendation 1", "recommendation 2"]
}`;

    const userPrompt = `Goal: ${attempts.goal}

Executions:
${JSON.stringify(attempts.executions, null, 2)}

Analyze these attempts and provide insights.`;

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

      const analysis = JSON.parse(response.choices[0].message.content);

      return {
        patterns: analysis.patterns || [],
        recommendations: analysis.recommendations || [],
      };
    } catch (error) {
      this.logger.error('Failed to compare attempts:', error);
      return {
        patterns: [],
        recommendations: ['Unable to analyze execution patterns'],
      };
    }
  }

  /**
   * Self-correction: identify and fix logical errors in reasoning
   */
  async selfCorrect(params: {
    reasoning: string;
    goal: string;
    context: Record<string, any>;
  }): Promise<{
    hasErrors: boolean;
    errors: string[];
    correctedReasoning?: string;
  }> {
    this.logger.log('Performing self-correction on reasoning');

    const systemPrompt = `You are a logical error detector for AI reasoning.
Analyze the reasoning for:
1. Logical fallacies
2. Incorrect assumptions
3. Missing steps
4. Contradictions
5. Bias

Return JSON:
{
  "hasErrors": true/false,
  "errors": ["error 1", "error 2"],
  "correctedReasoning": "corrected version if errors found"
}`;

    const userPrompt = `Goal: ${params.goal}

Reasoning to check:
${params.reasoning}

Context:
${JSON.stringify(params.context, null, 2)}

Identify any errors and provide corrected reasoning if needed.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.configService.get<string>('OPENAI_MODEL', 'gpt-4-turbo-preview'),
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0].message.content);

      if (result.hasErrors) {
        this.logger.warn(`Self-correction found ${result.errors.length} errors`);
      }

      return result;
    } catch (error) {
      this.logger.error('Failed to self-correct:', error);
      return {
        hasErrors: false,
        errors: [],
      };
    }
  }
}
