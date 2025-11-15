import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { ToolDefinition } from '../tool.service';

@Injectable()
export class FileIoTool {
  private readonly sandboxDir = path.join(process.cwd(), 'sandbox');

  getDefinition(): ToolDefinition {
    return {
      name: 'file_io',
      version: '1.0.0',
      description: 'Performs sandboxed file I/O operations',
      schema: {
        input: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['read', 'write', 'append', 'delete', 'list'],
              description: 'File operation to perform',
            },
            filename: { type: 'string', description: 'File name (within sandbox)' },
            content: { type: 'string', description: 'Content to write/append' },
          },
          required: ['action', 'filename'],
        },
        output: {
          type: 'object',
        },
      },
      timeout: 10000,
      execute: async (input: any) => {
        return this.performFileOperation(input);
      },
    };
  }

  private async performFileOperation(input: {
    action: string;
    filename: string;
    content?: string;
  }): Promise<any> {
    // Ensure sandbox directory exists
    try {
      await fs.mkdir(this.sandboxDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Sanitize filename to prevent path traversal
    const sanitizedFilename = path.basename(input.filename);
    const filePath = path.join(this.sandboxDir, sanitizedFilename);

    // Ensure the resolved path is within sandbox
    if (!filePath.startsWith(this.sandboxDir)) {
      throw new Error('Path traversal detected - access denied');
    }

    switch (input.action) {
      case 'read':
        return this.readFile(filePath);

      case 'write':
        if (!input.content) {
          throw new Error('Content required for write action');
        }
        return this.writeFile(filePath, input.content);

      case 'append':
        if (!input.content) {
          throw new Error('Content required for append action');
        }
        return this.appendFile(filePath, input.content);

      case 'delete':
        return this.deleteFile(filePath);

      case 'list':
        return this.listFiles();

      default:
        throw new Error(`Unknown action: ${input.action}`);
    }
  }

  private async readFile(filePath: string): Promise<any> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return {
        success: true,
        content,
        filename: path.basename(filePath),
      };
    } catch (error) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }

  private async writeFile(filePath: string, content: string): Promise<any> {
    try {
      await fs.writeFile(filePath, content, 'utf-8');
      return {
        success: true,
        message: `File written: ${path.basename(filePath)}`,
        filename: path.basename(filePath),
        bytes: Buffer.byteLength(content),
      };
    } catch (error) {
      throw new Error(`Failed to write file: ${error.message}`);
    }
  }

  private async appendFile(filePath: string, content: string): Promise<any> {
    try {
      await fs.appendFile(filePath, content, 'utf-8');
      return {
        success: true,
        message: `Content appended to: ${path.basename(filePath)}`,
        filename: path.basename(filePath),
        bytes: Buffer.byteLength(content),
      };
    } catch (error) {
      throw new Error(`Failed to append to file: ${error.message}`);
    }
  }

  private async deleteFile(filePath: string): Promise<any> {
    try {
      await fs.unlink(filePath);
      return {
        success: true,
        message: `File deleted: ${path.basename(filePath)}`,
        filename: path.basename(filePath),
      };
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  private async listFiles(): Promise<any> {
    try {
      const files = await fs.readdir(this.sandboxDir);
      const fileStats = await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(this.sandboxDir, file);
          const stats = await fs.stat(filePath);
          return {
            filename: file,
            size: stats.size,
            modified: stats.mtime,
            isDirectory: stats.isDirectory(),
          };
        }),
      );

      return {
        success: true,
        files: fileStats,
        count: fileStats.length,
      };
    } catch (error) {
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }
}
