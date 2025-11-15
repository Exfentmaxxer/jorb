import { Injectable } from '@nestjs/common';
import { ToolDefinition } from '../tool.service';

@Injectable()
export class SchedulerTool {
  getDefinition(): ToolDefinition {
    return {
      name: 'scheduler',
      version: '1.0.0',
      description: 'Schedules tasks and manages time-based operations',
      schema: {
        input: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['schedule', 'cancel', 'list'],
              description: 'Action to perform',
            },
            taskName: {
              type: 'string',
              description: 'Name of the task to schedule',
            },
            scheduledTime: {
              type: 'string',
              description: 'ISO 8601 datetime string',
            },
            recurrence: {
              type: 'string',
              enum: ['once', 'daily', 'weekly', 'monthly'],
              description: 'Recurrence pattern',
            },
          },
          required: ['action'],
        },
        output: {
          type: 'object',
        },
      },
      timeout: 10000,
      execute: async (input: any) => {
        return this.handleSchedule(input);
      },
    };
  }

  private async handleSchedule(input: {
    action: 'schedule' | 'cancel' | 'list';
    taskName?: string;
    scheduledTime?: string;
    recurrence?: string;
  }): Promise<any> {
    switch (input.action) {
      case 'schedule':
        if (!input.taskName || !input.scheduledTime) {
          throw new Error('taskName and scheduledTime required for schedule action');
        }
        return this.scheduleTask(
          input.taskName,
          input.scheduledTime,
          input.recurrence || 'once',
        );

      case 'cancel':
        if (!input.taskName) {
          throw new Error('taskName required for cancel action');
        }
        return this.cancelTask(input.taskName);

      case 'list':
        return this.listScheduledTasks();

      default:
        throw new Error(`Unknown action: ${input.action}`);
    }
  }

  private async scheduleTask(
    taskName: string,
    scheduledTime: string,
    recurrence: string,
  ): Promise<any> {
    const time = new Date(scheduledTime);

    if (isNaN(time.getTime())) {
      throw new Error('Invalid datetime format');
    }

    if (time < new Date()) {
      throw new Error('Cannot schedule task in the past');
    }

    // In a real implementation, this would store in database and use a job queue
    return {
      success: true,
      message: `Task "${taskName}" scheduled for ${time.toISOString()}`,
      task: {
        name: taskName,
        scheduledTime: time.toISOString(),
        recurrence,
        status: 'scheduled',
      },
    };
  }

  private async cancelTask(taskName: string): Promise<any> {
    // In a real implementation, this would remove from database/job queue
    return {
      success: true,
      message: `Task "${taskName}" cancelled`,
    };
  }

  private async listScheduledTasks(): Promise<any> {
    // In a real implementation, this would query database
    return {
      success: true,
      tasks: [],
      message: 'No scheduled tasks',
    };
  }
}
