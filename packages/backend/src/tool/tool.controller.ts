import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ToolService } from './tool.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('tools')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tools')
export class ToolController {
  constructor(private readonly toolService: ToolService) {}

  @Get()
  @ApiOperation({ summary: 'List all tools' })
  @ApiResponse({ status: 200, description: 'List of available tools' })
  async list() {
    return this.toolService.getAllTools();
  }

  @Get(':name')
  @ApiOperation({ summary: 'Get tool details' })
  @ApiResponse({ status: 200, description: 'Tool found' })
  @ApiResponse({ status: 404, description: 'Tool not found' })
  async getOne(@Param('name') name: string) {
    return this.toolService.getTool(name);
  }

  @Post(':name/execute')
  @ApiOperation({ summary: 'Execute a tool' })
  @ApiResponse({ status: 200, description: 'Tool executed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async execute(
    @Request() req,
    @Param('name') name: string,
    @Body() body: { input: any; taskId?: string },
  ) {
    const result = await this.toolService.executeTool(name, body.input, body.taskId);
    return {
      success: true,
      result,
    };
  }

  @Put(':name/status')
  @ApiOperation({ summary: 'Enable or disable a tool' })
  @ApiResponse({ status: 200, description: 'Tool status updated' })
  async updateStatus(
    @Param('name') name: string,
    @Body() body: { isEnabled: boolean },
  ) {
    return this.toolService.setToolStatus(name, body.isEnabled);
  }

  @Get(':name/executions')
  @ApiOperation({ summary: 'Get tool execution history' })
  @ApiResponse({ status: 200, description: 'Execution history' })
  async getExecutions(
    @Param('name') name: string,
    @Query('limit') limit?: number,
  ) {
    return this.toolService.getExecutionHistory({
      toolName: name,
      limit: limit ? parseInt(limit.toString()) : undefined,
    });
  }

  @Get('stats/overview')
  @ApiOperation({ summary: 'Get tool execution statistics' })
  @ApiResponse({ status: 200, description: 'Execution statistics' })
  async getStats(@Query('tool') toolName?: string) {
    return this.toolService.getToolStats(toolName);
  }

  @Post('reload')
  @ApiOperation({ summary: 'Reload all tools (development only)' })
  @ApiResponse({ status: 200, description: 'Tools reloaded' })
  async reload() {
    await this.toolService.reloadTools();
    return {
      success: true,
      message: 'Tools reloaded successfully',
    };
  }
}
