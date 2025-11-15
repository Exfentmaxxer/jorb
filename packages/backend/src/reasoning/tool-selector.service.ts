import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PlanStep } from './planner.service';
import { ToolService } from '../tool/tool.service';

export interface ToolSelectionInput {
  step: PlanStep;
  availableTools: string[];
  context: Record<string, any>;
}

export interface ToolSelectionResult {
  toolName: string;
  confidence: number;
  reasoning: string;
  fallbackTools: string[];
}

@Injectable()
export class ToolSelectorService {
  private readonly logger = new Logger(ToolSelectorService.name);
  private readonly openai: OpenAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly toolService: ToolService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  /**
   * Select the most appropriate tool for a given step
   */
  async selectTool(input: ToolSelectionInput): Promise<ToolSelectionResult> {
    this.logger.log(`Selecting tool for step: ${input.step.name}`);

    // Get all available tools from registry
    const allTools = await this.toolService.getAllTools();
    const enabledTools = allTools.filter((t) => t.isEnabled);

    // If step suggests specific tools, prioritize those
    const candidateTools = input.step.suggestedTools?.length
      ? enabledTools.filter((t) => input.step.suggestedTools.includes(t.name))
      : enabledTools;

    if (candidateTools.length === 0) {
      throw new Error('No suitable tools available for this step');
    }

    // If only one tool available, use it
    if (candidateTools.length === 1) {
      return {
        toolName: candidateTools[0].name,
        confidence: 0.9,
        reasoning: 'Only available tool',
        fallbackTools: [],
      };
    }

    // Use LLM to select best tool
    const systemPrompt = `You are an expert at selecting the right tool for a task.
Analyze the step requirements and available tools, then select the most appropriate one.

Consider:
1. Tool capabilities vs step requirements
2. Tool reliability and performance
3. Fallback options

Return JSON:
{
  "toolName": "selected_tool",
  "confidence": 0.95,
  "reasoning": "why this tool is best",
  "fallbackTools": ["fallback1", "fallback2"]
}`;

    const userPrompt = `Step: ${input.step.name}
Description: ${input.step.description}
Expected output: ${input.step.expectedOutput || 'not specified'}

Available tools:
${JSON.stringify(
  candidateTools.map((t) => ({
    name: t.name,
    description: t.description,
    schema: t.schema,
  })),
  null,
  2,
)}

Context:
${JSON.stringify(input.context, null, 2)}

Select the best tool for this step.`;

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

      const selection = JSON.parse(response.choices[0].message.content) as ToolSelectionResult;

      this.logger.log(`Selected tool: ${selection.toolName} (confidence: ${selection.confidence})`);

      return selection;
    } catch (error) {
      this.logger.error('Failed to select tool:', error);

      // Fallback: use first suggested tool or first available
      const fallbackTool =
        input.step.suggestedTools?.[0] || candidateTools[0].name;

      return {
        toolName: fallbackTool,
        confidence: 0.5,
        reasoning: 'Fallback selection due to selection error',
        fallbackTools: candidateTools.slice(1).map((t) => t.name),
      };
    }
  }

  /**
   * Evaluate tool performance for future selection
   */
  async evaluateToolPerformance(params: {
    toolName: string;
    stepDescription: string;
    success: boolean;
    executionTime: number;
    error?: string;
  }): Promise<{
    score: number;
    feedback: string;
  }> {
    this.logger.log(`Evaluating performance of tool: ${params.toolName}`);

    const baseScore = params.success ? 1.0 : 0.0;
    const timeScore = Math.max(0, 1 - params.executionTime / 60000); // Penalize if over 1 minute
    const score = (baseScore + timeScore) / 2;

    const feedback = params.success
      ? `Tool executed successfully in ${params.executionTime}ms`
      : `Tool failed: ${params.error}`;

    // Store this evaluation for learning (could be stored in database)
    this.logger.debug(`Tool ${params.toolName} score: ${score}`);

    return { score, feedback };
  }
}
