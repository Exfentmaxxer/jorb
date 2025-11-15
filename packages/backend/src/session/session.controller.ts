import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SessionService } from './session.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  async create(@Request() req, @Body() body: { contextData?: Record<string, any> }) {
    return this.sessionService.create(req.user.id, body.contextData);
  }

  @Get()
  async findAll(@Request() req) {
    return this.sessionService.findAll(req.user.id);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.sessionService.findOne(req.user.id, id);
  }

  @Post(':id/terminate')
  async terminate(@Request() req, @Param('id') id: string) {
    return this.sessionService.terminate(req.user.id, id);
  }
}
