import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TaskService } from './task.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TaskStatus } from '@prisma/client';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  async create(
    @Request() req,
    @Body()
    body: {
      title: string;
      description?: string;
      priority?: number;
      sessionId?: string;
    },
  ) {
    return this.taskService.create({
      userId: req.user.id,
      ...body,
    });
  }

  @Get()
  @ApiOperation({ summary: 'List tasks' })
  @ApiResponse({ status: 200, description: 'List of tasks' })
  async findAll(
    @Request() req,
    @Query('status') status?: TaskStatus,
    @Query('limit') limit?: number,
  ) {
    return this.taskService.findAll(req.user.id, {
      status,
      limit: limit ? parseInt(limit.toString()) : undefined,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get task statistics' })
  @ApiResponse({ status: 200, description: 'Task statistics' })
  async getStats(@Request() req) {
    return this.taskService.getStats(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiResponse({ status: 200, description: 'Task found' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async findOne(@Request() req, @Param('id') id: string) {
    return this.taskService.findOne(req.user.id, id);
  }

  @Post(':id/pause')
  @ApiOperation({ summary: 'Pause task execution' })
  @ApiResponse({ status: 200, description: 'Task paused' })
  async pause(@Request() req, @Param('id') id: string) {
    return this.taskService.pause(req.user.id, id);
  }

  @Post(':id/resume')
  @ApiOperation({ summary: 'Resume task execution' })
  @ApiResponse({ status: 200, description: 'Task resumed' })
  async resume(@Request() req, @Param('id') id: string) {
    return this.taskService.resume(req.user.id, id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel task execution' })
  @ApiResponse({ status: 200, description: 'Task cancelled' })
  async cancel(@Request() req, @Param('id') id: string) {
    return this.taskService.cancel(req.user.id, id);
  }
}
