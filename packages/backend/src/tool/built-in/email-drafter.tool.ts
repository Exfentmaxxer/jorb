import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ToolDefinition } from '../tool.service';

@Injectable()
export class EmailDrafterTool {
  private readonly openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  getDefinition(): ToolDefinition {
    return {
      name: 'email_drafter',
      version: '1.0.0',
      description: 'Drafts professional emails based on requirements',
      schema: {
        input: {
          type: 'object',
          properties: {
            recipient: { type: 'string', description: 'Email recipient name' },
            subject: { type: 'string', description: 'Email subject' },
            purpose: { type: 'string', description: 'Purpose of the email' },
            tone: {
              type: 'string',
              enum: ['formal', 'casual', 'friendly', 'professional'],
              description: 'Desired tone',
            },
            keyPoints: {
              type: 'array',
              items: { type: 'string' },
              description: 'Key points to include',
            },
          },
          required: ['purpose'],
        },
        output: {
          type: 'object',
          properties: {
            subject: { type: 'string' },
            body: { type: 'string' },
          },
        },
      },
      timeout: 30000,
      execute: async (input: any) => {
        return this.draftEmail(input);
      },
    };
  }

  private async draftEmail(input: {
    recipient?: string;
    subject?: string;
    purpose: string;
    tone?: string;
    keyPoints?: string[];
  }): Promise<{ subject: string; body: string }> {
    const tone = input.tone || 'professional';
    const recipient = input.recipient || 'the recipient';

    const prompt = `Draft a ${tone} email with the following details:

Recipient: ${recipient}
${input.subject ? `Subject: ${input.subject}` : ''}
Purpose: ${input.purpose}

${input.keyPoints && input.keyPoints.length > 0 ? `Key points to include:\n${input.keyPoints.map((p) => `- ${p}`).join('\n')}` : ''}

Generate a complete email with subject line and body.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content:
              'You are a professional email writer. Generate well-structured, clear emails.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      });

      const content = response.choices[0].message.content || '';

      // Parse subject and body
      const subjectMatch = content.match(/Subject:\s*(.+)/i);
      const subject = subjectMatch ? subjectMatch[1].trim() : input.subject || 'No Subject';

      // Remove subject line from body
      const body = content.replace(/Subject:\s*.+/i, '').trim();

      return { subject, body };
    } catch (error) {
      throw new Error(`Email drafting failed: ${error.message}`);
    }
  }
}
