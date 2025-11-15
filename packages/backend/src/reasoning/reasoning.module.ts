import { Module } from '@nestjs/common';
import { ReasoningService } from './reasoning.service';
import { PlannerService } from './planner.service';
import { ReflectionService } from './reflection.service';
import { ToolSelectorService } from './tool-selector.service';
import { ExecutionService } from './execution.service';
import { ContextService } from './context.service';
import { MemoryModule } from '../memory/memory.module';
import { ToolModule } from '../tool/tool.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, MemoryModule, ToolModule],
  providers: [
    ReasoningService,
    PlannerService,
    ReflectionService,
    ToolSelectorService,
    ExecutionService,
    ContextService,
  ],
  exports: [ReasoningService, ExecutionService, ContextService],
})
export class ReasoningModule {}
