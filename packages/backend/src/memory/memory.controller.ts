import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MemoryService } from './memory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MemoryType } from '@prisma/client';

@ApiTags('memory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('memory')
export class MemoryController {
  constructor(private readonly memoryService: MemoryService) {}

  @Post()
  @ApiOperation({ summary: 'Store a new memory' })
  @ApiResponse({ status: 201, description: 'Memory created successfully' })
  async store(
    @Request() req,
    @Body()
    body: {
      type: MemoryType;
      content: string;
      metadata?: Record<string, any>;
      expiresAt?: string;
    },
  ) {
    return this.memoryService.store({
      userId: req.user.id,
      type: body.type,
      content: body.content,
      metadata: body.metadata,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
    });
  }

  @Post('search')
  @ApiOperation({ summary: 'Search memories by semantic similarity' })
  @ApiResponse({ status: 200, description: 'Search results' })
  async search(
    @Request() req,
    @Body()
    body: {
      query: string;
      limit?: number;
      types?: MemoryType[];
      minScore?: number;
    },
  ) {
    return this.memoryService.search({
      userId: req.user.id,
      query: body.query,
      limit: body.limit,
      types: body.types,
      minScore: body.minScore,
    });
  }

  @Get()
  @ApiOperation({ summary: 'List memories' })
  @ApiResponse({ status: 200, description: 'List of memories' })
  async list(
    @Request() req,
    @Query('type') type?: MemoryType,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.memoryService.list({
      userId: req.user.id,
      type,
      limit: limit ? parseInt(limit.toString()) : undefined,
      offset: offset ? parseInt(offset.toString()) : undefined,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get memory statistics' })
  @ApiResponse({ status: 200, description: 'Memory statistics' })
  async getStats(@Request() req) {
    return this.memoryService.getStats(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get memory by ID' })
  @ApiResponse({ status: 200, description: 'Memory found' })
  @ApiResponse({ status: 404, description: 'Memory not found' })
  async getById(@Request() req, @Param('id') id: string) {
    return this.memoryService.getById(req.user.id, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update memory' })
  @ApiResponse({ status: 200, description: 'Memory updated' })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body()
    body: {
      content?: string;
      metadata?: Record<string, any>;
      score?: number;
    },
  ) {
    return this.memoryService.update(req.user.id, id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete memory' })
  @ApiResponse({ status: 200, description: 'Memory deleted' })
  async delete(@Request() req, @Param('id') id: string) {
    await this.memoryService.delete(req.user.id, id);
    return { message: 'Memory deleted successfully' };
  }

  @Post('consolidate')
  @ApiOperation({ summary: 'Consolidate short-term memories' })
  @ApiResponse({ status: 200, description: 'Consolidation complete' })
  async consolidate(@Request() req) {
    return this.memoryService.consolidate(req.user.id);
  }

  @Post('prune')
  @ApiOperation({ summary: 'Prune expired and low-value memories' })
  @ApiResponse({ status: 200, description: 'Pruning complete' })
  async prune(@Request() req) {
    return this.memoryService.prune(req.user.id);
  }
}
