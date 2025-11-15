import { Injectable } from '@nestjs/common';
import { ToolDefinition } from '../tool.service';

@Injectable()
export class CalculatorTool {
  getDefinition(): ToolDefinition {
    return {
      name: 'calculator',
      version: '1.0.0',
      description: 'Performs mathematical calculations',
      schema: {
        input: {
          type: 'object',
          properties: {
            expression: {
              type: 'string',
              description: 'Mathematical expression to evaluate (e.g., "2 + 2", "sqrt(16)")',
            },
          },
          required: ['expression'],
        },
        output: {
          type: 'object',
          properties: {
            result: { type: 'number' },
            expression: { type: 'string' },
          },
        },
      },
      timeout: 5000,
      maxRetries: 1,
      execute: async (input: { expression: string }) => {
        return this.calculate(input.expression);
      },
    };
  }

  private async calculate(expression: string): Promise<{ result: number; expression: string }> {
    // Sanitize expression to prevent code injection
    const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');

    if (sanitized !== expression) {
      throw new Error('Invalid characters in expression');
    }

    try {
      // Safe evaluation using Function constructor
      // In production, use a proper math expression parser like mathjs
      const result = Function(`'use strict'; return (${sanitized})`)();

      if (typeof result !== 'number' || !isFinite(result)) {
        throw new Error('Invalid calculation result');
      }

      return {
        result,
        expression: sanitized,
      };
    } catch (error) {
      throw new Error(`Calculation failed: ${error.message}`);
    }
  }
}
