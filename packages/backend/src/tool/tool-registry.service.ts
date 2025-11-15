import { Injectable, Logger } from '@nestjs/common';
import { ToolDefinition } from './tool.service';

@Injectable()
export class ToolRegistryService {
  private readonly logger = new Logger(ToolRegistryService.name);
  private readonly tools: Map<string, ToolDefinition> = new Map();

  /**
   * Register a tool
   */
  register(tool: ToolDefinition): void {
    if (this.tools.has(tool.name)) {
      this.logger.warn(`Tool ${tool.name} already registered, replacing...`);
    }

    this.tools.set(tool.name, tool);
    this.logger.debug(`Registered tool: ${tool.name} v${tool.version}`);
  }

  /**
   * Unregister a tool
   */
  unregister(toolName: string): boolean {
    const result = this.tools.delete(toolName);
    if (result) {
      this.logger.debug(`Unregistered tool: ${toolName}`);
    }
    return result;
  }

  /**
   * Get a tool by name
   */
  get(toolName: string): ToolDefinition | undefined {
    return this.tools.get(toolName);
  }

  /**
   * Check if tool exists
   */
  has(toolName: string): boolean {
    return this.tools.has(toolName);
  }

  /**
   * Get all registered tools
   */
  getAll(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get all tool names
   */
  getToolNames(): string[] {
    return Array.from(this.tools.keys());
  }

  /**
   * Get tool count
   */
  getToolCount(): number {
    return this.tools.size;
  }

  /**
   * Clear all tools
   */
  clear(): void {
    this.tools.clear();
    this.logger.log('All tools cleared from registry');
  }

  /**
   * Get tools by category/tag (if metadata supports it)
   */
  filterTools(predicate: (tool: ToolDefinition) => boolean): ToolDefinition[] {
    return this.getAll().filter(predicate);
  }
}
