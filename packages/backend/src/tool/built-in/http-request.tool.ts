import { Injectable } from '@nestjs/common';
import { ToolDefinition } from '../tool.service';

@Injectable()
export class HttpRequestTool {
  getDefinition(): ToolDefinition {
    return {
      name: 'http_request',
      version: '1.0.0',
      description: 'Makes HTTP requests to external APIs',
      schema: {
        input: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'Target URL' },
            method: {
              type: 'string',
              enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
              description: 'HTTP method',
            },
            headers: { type: 'object', description: 'Request headers' },
            body: { type: 'object', description: 'Request body (for POST/PUT/PATCH)' },
            timeout: { type: 'number', description: 'Request timeout in ms' },
          },
          required: ['url', 'method'],
        },
        output: {
          type: 'object',
        },
      },
      timeout: 30000,
      execute: async (input: any) => {
        return this.makeRequest(input);
      },
    };
  }

  private async makeRequest(input: {
    url: string;
    method: string;
    headers?: Record<string, string>;
    body?: any;
    timeout?: number;
  }): Promise<any> {
    // Validate URL
    try {
      new URL(input.url);
    } catch {
      throw new Error('Invalid URL format');
    }

    const controller = new AbortController();
    const timeout = input.timeout || 10000;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const options: RequestInit = {
        method: input.method,
        headers: {
          'Content-Type': 'application/json',
          ...input.headers,
        },
        signal: controller.signal,
      };

      if (input.body && ['POST', 'PUT', 'PATCH'].includes(input.method)) {
        options.body = JSON.stringify(input.body);
      }

      const response = await fetch(input.url, options);
      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type');
      let data: any;

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      return {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }

      throw new Error(`HTTP request failed: ${error.message}`);
    }
  }
}
